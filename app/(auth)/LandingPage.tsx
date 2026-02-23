import { router } from "expo-router";
import React from "react";
import { Image, Linking, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GrouplyButton from "../../app-components/shared/GrouplyButton";

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
              router.push("/SignupEmail");
            }}
          />

          <GrouplyButton
            label="Demo"
            variant="text"
            size="large"
            fullWidth
            onPress={() => {
              router.push("/DemoLogin");
            }}
          />
        </View>
        {/* Bottom links */}
        <View className="absolute bottom-6 w-full px-8">
          <View className="w-full flex-row justify-center items-center">
            <Text
              className="text-xs text-muted-darker underline mr-3"
              onPress={() =>
                Linking.openURL("https://grouply.carrd.co/#privacypolicy")
              }
            >
              Privacy Policy
            </Text>

            <View className="w-2 h-2 rounded-full bg-primary mx-2" />

            <Text
              className="text-xs text-muted-darker underline ml-3"
              onPress={() =>
                Linking.openURL("https://grouply.carrd.co/#termsandconditions")
              }
            >
              Terms & Conditions
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LandingPage;
