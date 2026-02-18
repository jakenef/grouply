import FormField from "@/app-components/shared/FormField";
import LocationPicker, {
  LocationData,
} from "@/app-components/shared/LocationPicker";
import OptionsSelector from "@/app-components/shared/OptionsSelector";
import ProfileImagePicker from "@/app-components/shared/ProfileImagePicker";
import RangeSlider from "@/app-components/shared/RangeSlider";
import SliderSingle from "@/app-components/shared/SliderSingle";
import uploadImageUri from "@/lib/storage";
import { colors } from "@/lib/theme";
import { trpc } from "@/lib/trpc";
import { useCurrentUser } from "@/lib/useCurrentUserHook";
import calculateAge from "@/shared/utils/calculateAge";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Interest {
  id: string;
  label: string;
  slug: string;
}

interface Trait {
  id: string;
  label: string;
  slug: string;
  desc?: string;
}

// interface CustomOption {
//   id: string;
//   label: string;
// }

const milesToKm = (miles: number): number => {
  return Math.round(miles * 1.60934);
};

const kmToMiles = (km: number): number => {
  return Math.round(km / 1.60934);
};

const EditProfile = () => {
  const { user } = useCurrentUser();
  const insets = useSafeAreaInsets();

  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
  const initialLocation: LocationData | null = user?.location
    ? {
        ...user.location,
        placeId: user.location.id,
        formatted: user.location.formatted ?? "",
      }
    : null;
  const [location, setLocation] = useState<LocationData | null>(
    initialLocation,
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.interests.map((interest) => interest.interest.id) ?? [],
  );
  const [selectedTraits, setSelectedTraits] = useState<string[]>(
    user?.traitScores.map((traitScore) => traitScore.trait.id) ?? [],
  );
  // const [customInterests, setCustomInterests] = useState<CustomOption[]>([]);
  // const [customTraits, setCustomTraits] = useState<CustomOption[]>([]);
  const [travelDistance, setTravelDistance] = useState<number>(
    kmToMiles(user?.maxTravelKm ?? 0),
  );
  const [ageRange, setAgeRange] = useState<[number, number]>([
    user?.minAgePreference ?? 18,
    user?.maxAgePreference ?? 25,
  ]);
  const [groupSizeRange, setGroupSizeRange] = useState<[number, number]>([
    user?.maxGroupSize ?? 3,
    user?.minGroupSize ?? 6,
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const [errors, setErrors] = useState<{
    location?: string;
    traits?: string;
    interests?: string;
    ageRange?: string;
  }>({});

  const utils = trpc.useUtils();
  const updateUserMutation = trpc.users.updateMyUser.useMutation({
    onSuccess: () => {
      utils.users.getMyUser.invalidate();
    },
  });
  const interestsQuery = trpc.interests.getAllApprovedInterests.useQuery();
  const traitsQuery = trpc.traits.getAllApprovedTraits.useQuery();
  const userAge = calculateAge(new Date(user?.birthday!)) ?? 18;

  const validateForm = (): boolean => {
    const newErrors: {
      interests?: string;
      traits?: string;
      location?: string;
      ageRange?: string;
    } = {};

    if (selectedInterests.length < 3) {
      newErrors.interests = "Please select at least 3 interests";
    }

    if (selectedTraits.length < 3) {
      newErrors.traits = "Please select at least 3 traits";
    }

    if (!location) {
      newErrors.location = "Please select a location";
    }

    if (userAge < ageRange[0] || userAge > ageRange[1]) {
      newErrors.ageRange = "Your age is not in your preferred age range";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocationChange = (locationData: LocationData | null) => {
    if (locationData) {
      // Set the formatted location name to the state
      setLocation(locationData);
    } else {
      // Clear the location if null is passed
      setLocation(null);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    try {
      setIsSaving(true);
      let avatarUrlToSend: string | undefined = undefined;
      if (avatarUrl) {
        try {
          const { publicUrl } = await uploadImageUri(avatarUrl, {
            bucket: "avatars",
            userId: user?.id,
            maxSizeBytes: 1.5 * 1024 * 1024,
          });
          avatarUrlToSend = publicUrl;
        } catch (err: any) {
          console.error("Error uploading avatar:", err);
          Alert.alert(
            "Upload error",
            err?.message || "Failed to upload avatar. Please try again.",
          );
          return;
        }
      }
      // Convert miles to kilometers for backend storage
      const maxTravelKm = milesToKm(travelDistance);

      // Call the tRPC mutation to save preferences
      await updateUserMutation.mutateAsync({
        interestIds: selectedInterests,
        traitIds: selectedTraits,
        preferredGroupSizeMin: groupSizeRange[0],
        preferredGroupSizeMax: groupSizeRange[1],
        minAgePref: ageRange[0],
        maxAgePref: ageRange[1],
        maxTravelKm,
        avatarUrl: avatarUrlToSend,
        bio,
      });

      router.back();
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to save preferences. Please try again.",
      );
      setIsSaving(false);
    }
    return;
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior="padding"
      keyboardVerticalOffset={insets.top}
    >
      <View className="flex-1 bg-background px-4">
        <View className="flex-row justify-between pt-2 items-center mb-2">
          <Ionicons
            name="arrow-back-circle-outline"
            size={35}
            color={colors.primary}
            onPress={router.back}
          />

          {isSaving ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Pressable
              className="border-primary border-2 rounded-lg p-1"
              onPress={handleSave}
            >
              <Text className="text-lg text-primary">Save Changes</Text>
            </Pressable>
          )}
        </View>

        <ScrollView className="flex-1">
          <Text className="text-2xl font-semibold py-3">Edit Profile</Text>

          <View className="items-center py-4">
            <ProfileImagePicker value={avatarUrl} onChange={setAvatarUrl} />
          </View>

          <FormField
            label="Bio (Optional)"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people a bit about yourself..."
            multiline
            numberOfLines={4}
            containerClassName="mb-8"
            style={{ minHeight: 100 }}
          />

          {/* Location */}
          <LocationPicker
            mode="city"
            onChange={handleLocationChange}
            value={location}
            error={errors.location}
          />

          {/* Interests Selection */}
          <OptionsSelector
            title="Interests"
            options={
              interestsQuery.data?.map((interest) => ({
                id: interest.id,
                label: interest.label,
              })) || []
            }
            selectedOptions={selectedInterests}
            onSelectionChange={setSelectedInterests}
            minRequired={3}
            allowOther={false}
            error={errors.interests}
            // onCustomOptionAdded={(customOption) => {
            //   setCustomInterests((prev) => [...prev, customOption]);
            // }}
          />

          {/* Traits Selection */}
          <OptionsSelector
            title="Traits"
            options={
              traitsQuery.data?.map((trait) => ({
                id: trait.id,
                label: trait.label,
              })) || []
            }
            selectedOptions={selectedTraits}
            onSelectionChange={setSelectedTraits}
            minRequired={3}
            allowOther={false}
            error={errors.traits}
            // onCustomOptionAdded={(customOption) => {
            //   setCustomTraits((prev) => [...prev, customOption]);
            // }}
          />

          {/* Group Size Range */}
          <RangeSlider
            label="What is your preferred group size?"
            minValue={user?.minGroupSize ?? 3}
            maxValue={user?.maxGroupSize ?? 6}
            minLimit={2}
            maxLimit={12}
            step={1}
            onValuesChange={(values) => setGroupSizeRange(values)}
            formatLabel={(value) => (value === 9 ? "9" : String(value))}
          />

          {/* Max Travel Distance */}
          <SliderSingle
            label="How far are you willing to travel for an event?"
            value={travelDistance}
            minLimit={10}
            maxLimit={100}
            step={1}
            onValueChange={(value) => setTravelDistance(value)}
            formatLabel={(value) => `${value} mi (${milesToKm(value)} km)`}
          />

          {/* Age Range */}
          <RangeSlider
            label="What is your preferred age range of other attendees?"
            minValue={user?.minAgePreference ?? 18}
            maxValue={user?.maxAgePreference ?? 25}
            minLimit={18}
            maxLimit={60}
            step={1}
            onValuesChange={(values) => setAgeRange(values)}
            formatLabel={(value) => (value === 60 ? "60" : String(value))}
            error={errors.ageRange}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;
