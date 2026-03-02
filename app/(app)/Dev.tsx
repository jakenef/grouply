import { trpc } from "@/lib/trpc";
import { useCurrentUser } from "@/lib/useCurrentUserHook";
import React from "react";
import { Alert, Linking, ScrollView, Text, View } from "react-native";
import { EnvDebugger } from "../../app-components/dev/EnvDebugger";
import TroubleshootDropdown from "../../app-components/dev/TroubleshootDropdown";
import TroubleshootItem from "../../app-components/dev/TroubleshootItem";

const Dev = () => {
  const { user } = useCurrentUser();

  // Only allow in development mode OR for admin users
  if (!__DEV__ && user?.role !== "ADMIN") {
    return (
      <View className="flex-1 bg-background items-center justify-center p-4">
        <Text className="text-lg text-gray-500">Access Denied</Text>
        <Text className="text-sm text-gray-400 mt-2">
          This screen is only available in development mode.
        </Text>
      </View>
    );
  }
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

  const { mutateAsync: createTraits } =
    trpc.troubleshooting.troubleshootingTraitsRouter.TRB_createTraits.useMutation();
  const { mutateAsync: deleteTraits } =
    trpc.troubleshooting.troubleshootingTraitsRouter.TRB_deleteTraits.useMutation();

  const { mutateAsync: createInterests } =
    trpc.troubleshooting.interestsRouter.TRB_createInterests.useMutation();
  const { mutateAsync: deleteInterests } =
    trpc.troubleshooting.interestsRouter.TRB_deleteInterests.useMutation();

  const { mutateAsync: generateLoginLink } =
    trpc.troubleshooting.troubleshootingAuthRouter.generateUserLoginLink.useMutation();

  const handleGenerateLoginLink = async () => {
    const email = await new Promise<string>((resolve) => {
      Alert.prompt(
        "Generate Login Link",
        "Enter user email or userId:",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve("") },
          {
            text: "Generate",
            onPress: (value: string | undefined) => resolve(value || ""),
          },
        ],
        "plain-text",
      );
    });

    if (!email) return;

    try {
      const result = await generateLoginLink({
        email: email.includes("@") ? email : undefined,
        userId: !email.includes("@") ? email : undefined,
      });

      Alert.alert(
        "Login Link Generated",
        `Email: ${result.email}\n\nClick "Open Link" to sign in as this user.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Copy Link",
            onPress: () => {
              // Note: You'd need @react-native-clipboard/clipboard for this
              Alert.alert("Link", result.loginLink);
            },
          },
          {
            text: "Open Link",
            onPress: () => Linking.openURL(result.loginLink),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to generate login link");
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-background">
        <View className="p-4">
          {/* Environment Variables Debugger */}
          <EnvDebugger />

          <TroubleshootDropdown title="Auth Tools">
            <TroubleshootItem
              title="🔐 Generate User Login Link"
              description="Generate a magic link to sign in as any user (for debugging prod issues)"
              onRun={async () => {
                await handleGenerateLoginLink();
              }}
            />
          </TroubleshootDropdown>

          <TroubleshootDropdown title="Database Tools">
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
              onRun={async (value?: number) => {
                await createTestUsers({ numUsers: value ?? 0 });
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
              onRun={async (value?: number) => {
                await createEvents({ numEvents: value ?? 0 });
              }}
            />
          </TroubleshootDropdown>
        </View>
      </ScrollView>
    </View>
  );
};

export default Dev;
