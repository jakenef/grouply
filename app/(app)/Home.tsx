import GrouplyButton from "@/components/GrouplyButton";
import { useAuth } from "@/lib/auth";
import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const { signOut } = useAuth();
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6">
        <Text className="text-2xl font-bold text-foreground mb-4">Home</Text>
        <Link href={"/(auth)/LandingPage"} className="text-primary mb-4">
          Go back to landing
        </Link>
        <GrouplyButton label="logout" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
};

export default Home;
