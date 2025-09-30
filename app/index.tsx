import { useAuth } from "@/lib/auth";
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const { session, isLoading } = useAuth();

  // While checking auth status, show loading UI
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4f47e5" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  // After loading, redirect based on authentication status
  if (session) {
    return <Redirect href="/(app)/Home" />;
  } else {
    return <Redirect href="/(auth)/LandingPage" />;
  }
}
