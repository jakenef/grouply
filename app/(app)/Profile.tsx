import GrouplyButton from "@/components/shared/GrouplyButton";
import { useAuth } from "@/lib/auth";
import { useCurrentUser } from "@/lib/useCurrentUserHook";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Profile = () => {
  const { user } = useCurrentUser();
  const { signOut } = useAuth();

  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";

  return (
    <View className="flex-1 p-6">
      <Text>Profile</Text>
      {isAdmin && (
        <TouchableOpacity
          onPress={() => router.push("/(app)/Dev")}
          className="flex-row items-center bg-primary rounded-lg px-4 py-2 mb-4"
        >
          <Ionicons name="construct" size={24} color="white" />
          <Text className="text-white font-semibold ml-2">Dev Tools</Text>
        </TouchableOpacity>
      )}
      <GrouplyButton label="logout" onPress={signOut} />
    </View>
  );
};

export default Profile;
