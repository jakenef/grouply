import { trpc } from "@/lib/trpc";
import { useCurrentUser } from "@/lib/useCurrentUserHook";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EnvDebugger } from "../../app-components/dev/EnvDebugger";
import TroubleshootDropdown from "../../app-components/dev/TroubleshootDropdown";
import TroubleshootItem from "../../app-components/dev/TroubleshootItem";
import { EventCard } from "../../app-components/events/EventCard";

const Dev = () => {
  const { user } = useCurrentUser();
  const utils = trpc.useUtils();

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

  const { data: reportedEvents, isLoading: isLoadingReports } =
    trpc.reports.getReportedEvents.useQuery(
      undefined,
      {
        enabled: user?.role === "ADMIN",
      }
    );

  const resolveReportMutation = trpc.reports.resolveReport.useMutation({
    onSuccess: () => {
      utils.reports.getReportedEvents.invalidate();
    },
  });

  const handleResolveReport = async (reportId: string) => {
    try {
      await resolveReportMutation.mutateAsync({ reportId });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to resolve report");
    }
  };

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
        "Enter user email:",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve("") },
          {
            text: "Generate",
            onPress: (value: string | undefined) => resolve(value || ""),
          },
        ],
        "plain-text"
      );
    });

    if (!email) return;

    try {
      const result = await generateLoginLink({ email });

      Alert.alert(
        "Login Link Generated",
        `Email: ${result.email}\n\nClick "Open Link" to sign in as this user.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Copy Link",
            onPress: () => {
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

          <TroubleshootDropdown title="Manage Reports">
            {isLoadingReports ? (
              <ActivityIndicator size="small" />
            ) : reportedEvents && reportedEvents.length > 0 ? (
              reportedEvents.map((item) => (
                <View
                  key={item.event.id}
                  className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-100"
                >
                  <EventCard
                    event={{
                      ...item.event,
                      startsAt: new Date(item.event.startsAt),
                      formattedLocation: item.event.formattedLocation ?? "Unknown location",
                    }}
                    onJoin={() => {
                      router.push({
                        pathname: "/(events)/Events/[id]",
                        params: { id: item.event.id },
                      });
                    }}
                  />
                  <View className="mt-2 pt-2 border-t border-gray-100">
                    <Text className="text-xs font-bold text-gray-500 mb-1">
                      EVENT ID: {item.event.id}
                    </Text>
                    <Text className="text-xs font-bold text-gray-500 mb-2">
                      HOST ID: {item.event.organizerId}
                    </Text>

                    <Text className="text-sm font-bold text-red-500 mb-2">
                      Reports ({item.reports.length}):
                    </Text>
                    {item.reports.map((report) => (
                      <View
                        key={report.id}
                        className="bg-red-50 p-3 rounded mb-2 border border-red-100"
                      >
                        <View className="flex-row justify-between items-start mb-2">
                          <View className="flex-1 mr-2">
                            <Text className="text-sm font-semibold text-red-700">
                              {report.reason}
                            </Text>
                            {report.description && (
                              <Text className="text-sm text-red-600 italic mt-1">
                                "{report.description}"
                              </Text>
                            )}
                          </View>
                          <TouchableOpacity
                            onPress={() => handleResolveReport(report.id)}
                            className="bg-red-600 px-3 py-1.5 rounded-md"
                          >
                            <Text className="text-white text-xs font-bold">
                              Mark Resolved
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View className="mt-2 pt-2 border-t border-red-100">
                          <Text className="text-xs text-red-800">
                            Reported by: {report.reporterName}
                          </Text>
                          <Text className="text-xs text-red-800">
                            Reporter ID: {report.reporterId}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 italic p-2 text-center">
                No reports found
              </Text>
            )}
          </TroubleshootDropdown>

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
                await deleteTestUsers();
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
