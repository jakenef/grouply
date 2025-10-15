import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const { session, isLoading } = useAuth();
  const userExistsQuery = trpc.users.checkUserExists.useQuery(undefined, {
    // Only run the query if we have a session
    enabled: !!session,
  });

  // While checking auth status, show loading UI
  if (isLoading || (session && userExistsQuery.isLoading)) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4f47e5" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  // After loading, redirect based on authentication and user status
  if (!session) {
    // No authentication, go to landing page
    return <Redirect href="/(auth)/LandingPage" />;
  } else if (userExistsQuery.data?.exists) {
    // Authenticated and user exists in database - go to home
    return <Redirect href="/(app)/Home" />;
  } else {
    // Authenticated but no user profile - go to onboarding
    return <Redirect href="/(auth)/AboutYouSetup" />;
  }
}
