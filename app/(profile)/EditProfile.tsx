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
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

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

// TODO: fix slider range for distance to min 10 and max 100, update pfp and bio and location didn't work, didn't prefill group size and age range correctly. Age range needs validation.

const milesToKm = (miles: number): number => {
  return Math.round(miles * 1.60934);
};

const kmToMiles = (km: number): number => {
  return Math.round(km / 1.60934);
};

const EditProfile = () => {
  const { user } = useCurrentUser();
  const [bio, setBio] = useState(user?.profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
  const initialLocation: LocationData | null = user?.location
    ? {
        ...user.location,
        placeId: user.location.id,
        formatted: user.location.formatted ?? "",
      }
    : null;
  const [location, setLocation] = useState<LocationData | null>(
    initialLocation
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.interests.map((interest) => interest.interest.id) ?? []
  );
  const [selectedTraits, setSelectedTraits] = useState<string[]>(
    user?.traitScores.map((traitScore) => traitScore.trait.id) ?? []
  );
  // const [customInterests, setCustomInterests] = useState<CustomOption[]>([]);
  // const [customTraits, setCustomTraits] = useState<CustomOption[]>([]);
  const [travelDistance, setTravelDistance] = useState<number>(
    kmToMiles(user?.profile?.maxTravelKm ?? 0)
  );
  const [ageRange, setAgeRange] = useState<[number, number]>([
    user?.profile?.minAgePref ?? 18,
    user?.profile?.maxAgePref ?? 25,
  ]);
  const [groupSizeRange, setGroupSizeRange] = useState<[number, number]>([
    user?.profile?.preferredGroupSizeMin ?? 3,
    user?.profile?.preferredGroupSizeMax ?? 6,
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const [errors, setErrors] = useState<{
    location?: string;
    traits?: string;
    interests?: string;
  }>({});

  const utils = trpc.useUtils();
  const updateUserMutation = trpc.users.updateMyUserAndProfile.useMutation({
    onSuccess: () => {
      utils.users.getMyProfile.invalidate();
    },
  });
  const interestsQuery = trpc.interests.getAllApprovedInterests.useQuery();
  const traitsQuery = trpc.traits.getAllApprovedTraits.useQuery();

  const validateForm = (): boolean => {
    const newErrors: {
      interests?: string;
      traits?: string;
      location?: string;
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
            err?.message || "Failed to upload avatar. Please try again."
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
      });

      router.back();
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to save preferences. Please try again."
      );
      setIsSaving(false);
    }
    return;
  };

  return (
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
      <View></View>

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
          minValue={3}
          maxValue={6}
          minLimit={2}
          maxLimit={9}
          step={1}
          onValuesChange={(values) => setGroupSizeRange(values)}
          formatLabel={(value) => (value === 9 ? "9" : String(value))}
        />

        {/* Max Travel Distance */}
        <SliderSingle
          label="How far are you willing to travel for an event?"
          value={travelDistance}
          minLimit={1}
          maxLimit={50}
          step={1}
          onValueChange={(value) => setTravelDistance(value)}
          formatLabel={(value) => `${value} mi (${milesToKm(value)} km)`}
        />

        {/* Age Range */}
        <RangeSlider
          label="What is your preferred age range of other attendees?"
          minValue={18}
          maxValue={25}
          minLimit={18}
          maxLimit={60}
          step={1}
          onValuesChange={(values) => setAgeRange(values)}
          formatLabel={(value) => (value === 60 ? "60" : String(value))}
        />
      </ScrollView>
    </View>
  );
};

export default EditProfile;
