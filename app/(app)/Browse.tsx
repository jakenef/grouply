import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Browse = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6">
        <Text className="text-2xl font-bold text-foreground">Browse</Text>
      </View>
    </SafeAreaView>
  );
};

export default Browse;
