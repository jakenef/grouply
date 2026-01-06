import BubbleList from "@/app-components/shared/BubbleList";
import GrouplyButton from "@/app-components/shared/GrouplyButton";
import ProfileImagePicker from "@/app-components/shared/ProfileImagePicker";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";
import { useCurrentUser } from "@/lib/useCurrentUserHook";
import calculateAge from "@/shared/utils/calculateAge";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const Profile = () => {
  const { user } = useCurrentUser();
  const { signOut } = useAuth();

  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";

  // Format joined date
  const formatJoinedDate = (date: Date | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const kmToMiles = (km: number): number => {
    return Math.round(km / 1.60934);
  };

  // Extract interests and traits
  const interests =
    user?.interests?.map((i: any) => i.interest?.name).filter(Boolean) || [];
  const traits =
    user?.traitScores?.map((t: any) => t.trait?.name).filter(Boolean) || [];

  const age = calculateAge(new Date(user?.birthday ?? 0));
  const joinedDate = formatJoinedDate(new Date(user?.joinedAt ?? 0));

  return (
    <ScrollView className="flex-1 px-4 bg-background">
      <View className="flex-row justify-between pt-2">
        <Text className="text-4xl font-semibold">Profile</Text>
        <Feather
          name="edit"
          size={25}
          color={colors.primary}
          onPress={() => router.push("/(profile)/EditProfile")}
        />
      </View>

      <View className="items-center py-4">
        <ProfileImagePicker
          value={user?.avatarUrl ?? null}
          onChange={() => null}
          displayOnly={true}
        />
        <Text className="py-3 text-2xl font-semibold">
          {user?.givenName} {user?.familyName || ""}
        </Text>
        {user?.bio && (
          <Text className="text-muted text-center px-4">{user.bio}</Text>
        )}
      </View>

      <BubbleList
        items={user?.interests.map((interest) => interest.interest.label) ?? []}
        title="Interests"
      />
      <BubbleList
        items={
          user?.traitScores.map((traitScore) => traitScore.trait.label) ?? []
        }
        title="Traits"
      />

      {/* Preferences */}
      <View className="border-border border-2 rounded-lg mt-1 mb-3 p-4">
        <Text className="text-xl font-semibold mb-3">Preferences</Text>
        <View className="space-y-3">
          <View className="py-2">
            <Text className="text-muted text-sm">Max Travel Distance</Text>
            <Text className="text-base">
              {kmToMiles(user?.maxTravelKm ?? 0)} mi
            </Text>
          </View>
          <View className="py-2">
            <Text className="text-muted text-sm">
              Preferred Age Range At Events
            </Text>
            <Text className="text-base">
              {user?.minAgePreference} - {user?.maxAgePreference}
            </Text>
          </View>
          <View className="py-2">
            <Text className="text-muted text-sm">Preferred Group Size</Text>
            <Text className="text-base">
              {user?.minGroupSize} - {user?.maxGroupSize}
            </Text>
          </View>
        </View>
      </View>

      {/* Account Information */}
      <View className="border-border border-2 rounded-lg p-4">
        <Text className="text-xl font-semibold mb-3">Account Information</Text>

        <View className="space-y-3">
          <View className="py-2">
            <Text className="text-muted text-sm">Email</Text>
            <Text className="text-base">{user?.email}</Text>
          </View>

          {user?.location && (
            <View className="py-2">
              <Text className="text-muted text-sm">Location</Text>
              <Text className="text-base">
                {user.location.city}, {user.location.region}
              </Text>
            </View>
          )}

          {age && (
            <View className="py-2">
              <Text className="text-muted text-sm">Age</Text>
              <Text className="text-base">{age}</Text>
            </View>
          )}

          {joinedDate && (
            <View className="py-2">
              <Text className="text-muted text-sm">Joined</Text>
              <Text className="text-base">{joinedDate}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Interests And Traits */}
      {interests.length > 0 && (
        <View className="my-2">
          <BubbleList items={interests} title="Interests" />
        </View>
      )}
      {traits.length > 0 && (
        <View className="my-2">
          <BubbleList items={traits} title="Personality Traits" />
        </View>
      )}

      {/* Dev Stuff */}
      {isAdmin && (
        <TouchableOpacity
          onPress={() => router.push("/(app)/Dev")}
          className="flex-row items-center bg-primary rounded-lg px-4 py-2 my-4"
        >
          <Feather name="tool" size={24} color="white" />
          <Text className="text-white font-semibold ml-2">Dev Tools</Text>
        </TouchableOpacity>
      )}

      <View className="pb-6">
        <GrouplyButton label="Logout" onPress={signOut} />
      </View>
    </ScrollView>
  );
};

export default Profile;
