import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import Constants from "expo-constants";
import type { AppRouter } from "../backend/server/routers";
import { supabase } from "./supabase";

export const trpc = createTRPCReact<AppRouter>();

// Expo automatically provides the dev server IP via Constants.expoConfig.hostUri
// Works for iOS, Android emulator, and physical devices automatically
const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_TRPC_URL) {
    return process.env.EXPO_PUBLIC_TRPC_URL;
  }

  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const host = debuggerHost.split(":")[0];
    return `http://${host}:3001/trpc`;
  }

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
        } = await supabase.auth.getSession();
        return {
          authorization: session?.access_token
            ? `Bearer ${session.access_token}`
            : undefined,
        };
      },
    }),
  ],
});
