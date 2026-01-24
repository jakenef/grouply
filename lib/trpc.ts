import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import Constants from "expo-constants";
import { Platform } from "react-native";
import type { AppRouter } from "../backend/server/routers";
import { supabase } from "./supabase";

export const trpc = createTRPCReact<AppRouter>();

// Get API URL with proper handling for Android emulator
const getApiUrl = () => {
  // Production or explicit override
  if (process.env.EXPO_PUBLIC_TRPC_URL) {
    return process.env.EXPO_PUBLIC_TRPC_URL;
  }

  // Development mode
  if (__DEV__) {
    // Android emulator: use special IP to reach host machine
    if (Platform.OS === "android") {
      return "http://10.0.2.2:3001/trpc";
    }

    // iOS/physical devices: use Expo dev server IP
    const host = Constants.expoConfig?.hostUri?.split(":")[0];
    if (host) {
      return `http://${host}:3001/trpc`;
    }
  }

  // Fallback
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
console.log("📡 tRPC Client URL:", getApiUrl());
