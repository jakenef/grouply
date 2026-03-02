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
        const {
          data: { session },
        } = await supabase.auth
          .getSession()
          .catch(() => ({ data: { session: null }, error: null }));

        console.log("[TRPC] Getting auth header for request:", {
          hasSession: !!session,
          userId: session?.user?.id,
          hasAccessToken: !!session?.access_token,
        });

        return {
          authorization: session?.access_token
            ? `Bearer ${session.access_token}`
            : undefined,
        };
      },
    }),
  ],
});

// Log the URL being used (only once)
const API_URL = getApiUrl();
