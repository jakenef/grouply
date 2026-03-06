import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import Constants from "expo-constants";
import { Platform } from "react-native";
import type { AppRouter } from "../backend/server/routers";
import { supabase } from "./supabase";

export const trpc = createTRPCReact<AppRouter>();

// Get API URL with proper handling for Android emulator
const getApiUrl = () => {
  // First, try to get from baked-in app config (works with EAS updates)
  const configUrl = Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_TRPC_URL;

  // In development mode, override localhost with Android emulator IP for Android
  if (
    __DEV__ &&
    Platform.OS === "android" &&
    configUrl?.includes("localhost")
  ) {
    const androidUrl = configUrl.replace("localhost", "10.0.2.2");
    console.log(
      "[TRPC] Android emulator detected, converting localhost to 10.0.2.2:",
      androidUrl,
    );
    return androidUrl;
  }

  if (configUrl) {
    console.log("[TRPC] Using URL from app config:", configUrl);
    return configUrl;
  }

  // Development mode fallbacks
  if (__DEV__) {
    // Android emulator: use special IP to reach host machine
    if (Platform.OS === "android") {
      console.log("[TRPC] Android emulator detected, using 10.0.2.2:3001");
      return "http://10.0.2.2:3001/trpc";
    }

    // iOS/physical devices: use Expo dev server IP
    const host = Constants.expoConfig?.hostUri?.split(":")[0];
    if (host) {
      const url = `http://${host}:3001/trpc`;
      console.log("[TRPC] Using Expo dev server host:", url);
      return url;
    }
  }

  // Fallback
  console.warn("[TRPC] No configured URL found, falling back to localhost");
  return "http://localhost:3001/trpc";
};

export const getBaseUrl = () => {
  const url = getApiUrl();
  return url.replace("/trpc", "");
};

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getApiUrl(),
      headers: async () => {
        const startTime = Date.now();
        console.log("[TRPC] Fetching session for request headers...");

        const {
          data: { session },
        } = await supabase.auth.getSession().catch((error) => {
          console.error("[TRPC] Failed to get session:", error);
          return { data: { session: null }, error: null };
        });

        const hasToken = !!session?.access_token;
        console.log(
          `[TRPC] Session fetched in ${Date.now() - startTime}ms, hasToken: ${hasToken}`,
        );

        return {
          authorization: session?.access_token
            ? `Bearer ${session.access_token}`
            : undefined,
        };
      },
      // Add timeout to prevent infinite hangs
      fetch: async (url, options) => {
        const requestId = Math.random().toString(36).substring(7);
        const startTime = Date.now();
        console.log(`[TRPC:${requestId}] 🚀 Starting request to: ${url}`);
        console.log(`[TRPC:${requestId}] Headers:`, options?.headers);

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.error(
            `[TRPC:${requestId}] ⏱️ Request timed out after 15 seconds`,
          );
          controller.abort();
        }, 15000); // 15 second timeout

        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });

          const duration = Date.now() - startTime;
          console.log(
            `[TRPC:${requestId}] ✅ Request completed in ${duration}ms, status: ${response.status}`,
          );

          clearTimeout(timeoutId);
          return response;
        } catch (error: any) {
          const duration = Date.now() - startTime;

          if (error.name === "AbortError") {
            console.error(
              `[TRPC:${requestId}] ❌ Request aborted after ${duration}ms (timeout)`,
            );
          } else {
            console.error(
              `[TRPC:${requestId}] ❌ Request failed after ${duration}ms:`,
              error.message,
            );
          }

          clearTimeout(timeoutId);
          throw error;
        }
      },
    }),
  ],
});

// Log the URL being used (only once)
const API_URL = getApiUrl();
