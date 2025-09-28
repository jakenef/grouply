import { AuthProvider } from "@/lib/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { trpc, trpcClient } from "../lib/trpc";
import "./globals.css";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            ></Stack>
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
