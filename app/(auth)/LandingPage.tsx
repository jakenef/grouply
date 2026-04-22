import { router } from "expo-router";
import React from "react";
import { Image, Linking, ScrollView, Text, View } from "react-native";
import GrouplyButton from "../../app-components/shared/GrouplyButton";

const LandingPage = () => {
  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-between">
          {/* Top Content */}
          <View className="items-center">
            <Text className="text-6xl font-bold text-primary mt-16">
              Grouply
            </Text>
            <Text className="text-5xl text-muted-darker mt-5">
              Meet Your People
            </Text>
            <Image
              source={require("../../assets/images/people.png")}
              className="w-96 h-96 mt-8"
              resizeMode="contain"
            />
          </View>

          {/* Middle - Buttons */}

          <View className="w-full px-8">
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
              className="mb-4"
              fullWidth
              className="mb-4"
              onPress={() => {
                router.push("/SignupEmail");
              }}
            />

            <GrouplyButton
              label="Try Demo (For Reviewers)"
              variant="outline"
              size="large"
              fullWidth
              className="mb-4"
              onPress={() => {
                router.push("/DemoLogin");
              }}
            />
          </View>

          {/* Bottom links */}
          <View className="w-full px-8 pb-6">
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
                  Linking.openURL(
                    "https://grouply.carrd.co/#termsandconditions",
                  )
                }
              >
                Terms & Conditions
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LandingPage;
