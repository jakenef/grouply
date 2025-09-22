import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LandingPage = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center">
        <Text className="text-6xl font-bold text-primary mt-16">Grouply</Text>
        <Text className="text-5xl text-muted">Meet Your People</Text>
      </View>
    </SafeAreaView>
  );
};

export default LandingPage;
