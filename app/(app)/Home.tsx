import GrouplyButton from "@/components/GrouplyButton";
import { useAuth } from "@/lib/auth";
import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const { signOut } = useAuth();
  return (
    <SafeAreaView>
      <View>
        <Text>Home</Text>
        <Link href={"/(auth)/LandingPage"}>Go back to landing</Link>
        <GrouplyButton label="logout" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
};

export default Home;
