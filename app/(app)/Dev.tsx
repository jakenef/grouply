import { trpc } from "@/lib/trpc";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TroubleshootItem from "../../components/TroubleshootItem";

const Dev = () => {
  const { mutateAsync: createLocations } =
    trpc.troubleshooting.troubleshootingLocationRouter.TRB_createLocations.useMutation();
  const { mutateAsync: deleteLocations } =
    trpc.troubleshooting.troubleshootingLocationRouter.TRB_deleteTestLocations.useMutation();

  const { mutateAsync: createTestUsers } =
    trpc.troubleshooting.troubleshootingUserRouter.TRB_createUserProfiles.useMutation();
  const { mutateAsync: deleteTestUsers } =
    trpc.troubleshooting.troubleshootingUserRouter.TRB_deleteTestUsers.useMutation();

  const { mutateAsync: createActivities } =
    trpc.troubleshooting.troubleshootingActivityRouter.TRB_createActivities.useMutation();
  const { mutateAsync: deleteActivities } =
    trpc.troubleshooting.troubleshootingActivityRouter.TRB_deleteActivites.useMutation();

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4">
          <TroubleshootItem
            title="Clear Test Users"
            description="Removes all test users from the database"
            onRun={async () => {
              await deleteTestUsers();
            }}
          />

          <TroubleshootItem
            title="Generate Test Users"
            description="Creates a specified number of test users in the database"
            requiresInput
            inputPlaceholder="Number of users to create"
            onRun={async (value) => {
              await createTestUsers({ numUsers: value });
            }}
          />

          <TroubleshootItem
            title="Generate Test Locations"
            description="Creates a fixed set of locations"
            onRun={async () => {
              await createLocations();
            }}
          />

          <TroubleshootItem
            title="Delete Test Locations"
            description="Deletes locations starting with TRB"
            onRun={async () => {
              await deleteLocations();
            }}
          />

          <TroubleshootItem
            title="Generate Activites"
            description="Creates a fixed set of activities"
            onRun={async () => {
              await createActivities();
            }}
          />

          <TroubleshootItem
            title="Delete Activities"
            description="Deletes all activities in db"
            onRun={async () => {
              await deleteActivities();
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dev;
