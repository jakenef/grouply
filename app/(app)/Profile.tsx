import { trpc } from "@/lib/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { data: profile } = trpc.users.getMyProfile.useQuery();
  const router = useRouter();
  const isAdmin = profile?.role === "ADMIN";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6">
        {isAdmin && (
          <TouchableOpacity
            onPress={() => router.push("/(app)/Dev")}
            className="flex-row items-center bg-primary rounded-lg px-4 py-2 mb-4"
          >
            <Ionicons name="construct" size={24} color="white" />
            <Text className="text-white font-semibold ml-2">Dev Tools</Text>
          </TouchableOpacity>
        )}
        <Text>Profile</Text>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
