import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Profile = () => {
  const { data: profile } = trpc.users.getMyProfile.useQuery();
  const router = useRouter();
  const isAdmin = profile?.role === "ADMIN";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6">
        {isAdmin && (
          <TouchableOpacity
            onPress={() => router.push("/(app)/dev")}
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
