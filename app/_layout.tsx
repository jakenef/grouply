import { AuthProvider } from "@/lib/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { getBaseUrl, trpc, trpcClient } from "../lib/trpc";
import "./globals.css";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Track if health check has been performed (persists across hot reloads)
let hasCheckedHealth = false;

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    // Only run health check once per session, not on hot reloads
    if (hasCheckedHealth) return;
    hasCheckedHealth = true;

    // Health check on startup
    const checkBackendHealth = async () => {
      const baseUrl = getBaseUrl();
      console.log("🔍 Checking backend health at:", `${baseUrl}/health`);

      try {
        const response = await fetch(`${baseUrl}/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Backend health check SUCCESS:", data);
        } else {
          console.error(
            "❌ Backend health check FAILED - Status:",
            response.status
          );
          Alert.alert("Connection Failed", `Unable to connect to server.`, [
            { text: "OK" },
          ]);
        }
      } catch (error) {
        console.error("❌ Backend health check ERROR:", error);
        console.error("   Make sure backend is running at:", baseUrl);
        Alert.alert("Connection Error", `Cannot reach server`, [
          { text: "OK" },
        ]);
      }
    };

    checkBackendHealth();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-background">
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "#ffffff" },
                }}
              ></Stack>
            </SafeAreaView>
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
