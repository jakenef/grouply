import { router } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GrouplyButton from "../../components/GrouplyButton";

const LandingPage = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center">
        <Text className="text-6xl font-bold text-primary mt-16">Grouply</Text>
        <Text className="text-5xl text-muted-darker mt-5">
          Meet Your People
        </Text>
        <Image
          source={require("../../assets/images/people.png")}
          className="w-96 h-96 mt-8"
          resizeMode="contain"
        />

        <View className="w-full px-8 mt-none mb-12">
          {/* Login Button */}
          <GrouplyButton
            label="Log In"
            variant="primary"
            size="large"
            fullWidth
            className="mb-4"
            onPress={() => {
              router.push("/LoginEmail");
            }}
          />

          {/* Create Account Button */}
          <GrouplyButton
            label="Create Account"
            variant="outline"
            size="large"
            fullWidth
            onPress={() => {
              /* We'll implement this when register screen exists */
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LandingPage;
