import { ErrorBoundary } from "@/app-components/dev/ErrorBoundary";
import { RenewalListener } from "@/app-components/shared/RenewalListener";
import { AuthProvider } from "@/lib/auth";
import { DeepLinkHandler } from "@/lib/DeepLinkHandler";
import { SafePostHogProvider } from "@/lib/posthog";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { Settings } from "react-native-fbsdk-next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { supabaseUrl } from "../lib/supabase";
import { getBaseUrl, trpc, trpcClient } from "../lib/trpc";
import "./globals.css";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Track if health check has been performed (persists across hot reloads)
let hasCheckedHealth = false;

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: any) => {
            console.error("[QueryClient] Query error:", error.message || error);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: any) => {
            console.error(
              "[QueryClient] Mutation error:",
              error.message || error,
            );
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1, // Retry once on failure
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 5000),
            networkMode: "online", // Only query when online
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

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
            response.status,
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

    const checkSupabaseHealth = async () => {
      if (!__DEV__ || !supabaseUrl) return;
      console.log(
        "🔍 Checking Supabase health at:",
        `${supabaseUrl}/auth/v1/health`,
      );

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          console.log("✅ Supabase health check SUCCESS");
        } else {
          console.error(
            "❌ Supabase health check FAILED - Status:",
            response.status,
          );
          Alert.alert(
            "Supabase Not Running",
            "Supabase returned an error. Make sure Docker is running and run `supabase start`.",
            [{ text: "OK" }],
          );
        }
      } catch (error: any) {
        const isTimeout = error.name === "AbortError";
        console.error(
          "❌ Supabase health check ERROR:",
          isTimeout ? "timed out" : error.message,
        );
        Alert.alert(
          "Supabase Not Running",
          `Cannot reach Supabase${isTimeout ? " (timed out)" : ""}.\n\nMake sure Docker is running, then:\n  supabase start`,
          [{ text: "OK" }],
        );
      }
    };

    checkBackendHealth();
    checkSupabaseHealth();
  }, []);

  useEffect(() => {
    const initMeta = async () => {
      Settings.initializeSDK();
      if (Platform.OS === "ios") {
        const { status } = await requestTrackingPermissionsAsync();
        if (status === "granted") {
          await Settings.setAdvertiserTrackingEnabled(true);
        }
      }
    };
    initMeta();
  }, []);

  return (
    <ErrorBoundary>
      <SafePostHogProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <DeepLinkHandler />
                <RenewalListener />
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
        </GestureHandlerRootView>
      </SafePostHogProvider>
    </ErrorBoundary>
  );
}
