import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TroubleshootItem from "../../components/TroubleshootItem";
import { trpc } from "../../lib/trpc";

const Dev = () => {
  const utils = trpc.useContext();

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4">
          <TroubleshootItem
            title="Clear Test Users"
            description="Removes all test users from the database"
            onRun={async () => {
              // This is an example - replace with your actual trpc mutation
              await new Promise((resolve) => setTimeout(resolve, 1000));
              throw new Error("Not implemented: Add your trpc mutation here");
            }}
          />

          <TroubleshootItem
            title="Generate Test Users"
            description="Creates a specified number of test users in the database"
            requiresInput
            inputPlaceholder="Number of users to create"
            onRun={async (value) => {
              if (!value || value <= 0) {
                throw new Error("Please enter a valid number of users");
              }
              // This is an example - replace with your actual trpc mutation
              await new Promise((resolve) => setTimeout(resolve, 1000));
              throw new Error("Not implemented: Add your trpc mutation here");
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dev;
