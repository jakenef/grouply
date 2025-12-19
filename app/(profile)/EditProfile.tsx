import FormField from "@/components/shared/FormField";
import LocationPicker, {
  LocationData,
} from "@/components/shared/LocationPicker";
import ProfileImagePicker from "@/components/shared/ProfileImagePicker";
import { colors } from "@/lib/theme";
import { useCurrentUser } from "@/lib/useCurrentUserHook";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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
  const [errors, setErrors] = useState<{
    location?: string;
  }>({});

  const handleLocationChange = (locationData: LocationData | null) => {
    if (locationData) {
      // Set the formatted location name to the state
      setLocation(locationData);
    } else {
      // Clear the location if null is passed
      setLocation(null);
    }
  };

  const handleSave = () => {
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
        <Pressable
          className="border-primary border-2 rounded-lg p-1"
          onPress={handleSave}
        >
          <Text className="text-lg text-primary">Save Changes</Text>
        </Pressable>
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
      </ScrollView>
    </View>
  );
};

export default EditProfile;
