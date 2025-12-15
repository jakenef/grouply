import { trpc } from "@/lib/trpc";
import React from "react";
import { ScrollView, View } from "react-native";
import TroubleshootItem from "../../components/shared/TroubleshootItem";

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

  const { mutateAsync: createEvents } =
    trpc.troubleshooting.troubleshootingEventRouter.TRB_createEvents.useMutation();
  const { mutateAsync: deleteEvents } =
    trpc.troubleshooting.troubleshootingEventRouter.TRB_deleteTestEvents.useMutation();
  const { mutateAsync: fixCoverImageUrls } =
    trpc.troubleshooting.troubleshootingEventRouter.TRB_fixCoverImageUrls.useMutation();

  const { mutateAsync: createTraits } =
    trpc.troubleshooting.troubleshootingTraitsRouter.TRB_createTraits.useMutation();
  const { mutateAsync: deleteTraits } =
    trpc.troubleshooting.troubleshootingTraitsRouter.TRB_deleteTraits.useMutation();

  const { mutateAsync: createInterests } =
    trpc.troubleshooting.interestsRouter.TRB_createInterests.useMutation();
  const { mutateAsync: deleteInterests } =
    trpc.troubleshooting.interestsRouter.TRB_deleteInterests.useMutation();

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-background">
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

          <TroubleshootItem
            title="Generate Traits"
            description="Creates a fixed set of traits"
            onRun={async () => {
              await createTraits({ numTraits: 10, useStarters: true });
            }}
          />

          <TroubleshootItem
            title="Delete Traits"
            description="Deletes all TRB traits in db"
            onRun={async () => {
              await deleteTraits();
            }}
          />

          <TroubleshootItem
            title="Generate Interests"
            description="Creates a fixed set of interests"
            onRun={async () => {
              await createInterests({ numInterests: 10, useStarters: true });
            }}
          />

          <TroubleshootItem
            title="Delete Interests"
            description="Deletes all TRB interests in db"
            onRun={async () => {
              await deleteInterests();
            }}
          />

          <TroubleshootItem
            title="Clear Test Events"
            description="Removes all test events from the database"
            onRun={async () => {
              await deleteEvents();
            }}
          />

          <TroubleshootItem
            title="Generate Test Events"
            description="Creates a specified number of test events in the database"
            requiresInput
            inputPlaceholder="Number of events to create"
            onRun={async (value) => {
              await createEvents({ numEvents: value });
            }}
          />

          <TroubleshootItem
            title="Fix Cover Image URLs"
            description="Sets coverImageUrl to the first image in imageUrls for all events with empty coverImageUrl"
            onRun={async () => {
              await fixCoverImageUrls();
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Dev;
