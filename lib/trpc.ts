import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../backend/server/routers";
import { supabase } from "./supabase";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: process.env.EXPO_PUBLIC_TRPC_URL || "http://localhost:3001/trpc",
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
