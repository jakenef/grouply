import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  return (
    <SafeAreaView>
      <View>
        <Text>Home</Text>
        <Link href={"/(auth)/LandingPage"}>Go back to landing</Link>
      </View>
    </SafeAreaView>
  );
};

export default Home;
