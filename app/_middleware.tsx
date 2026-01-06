import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { usePathname, useRouter } from "expo-router";
import { useEffect } from "react";

export default function AuthMiddleware() {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuth();
  const { data: profile } = trpc.users.getMyUser.useQuery(undefined, {
    enabled: !!session,
  });

  useEffect(() => {
    // If trying to access Dev screen
    if (pathname === "/(app)/Dev") {
      // Check if user is not an admin
      if (!session || profile?.role !== "ADMIN") {
        // Redirect to home if not admin
        router.replace("/(app)/Home");
      }
    }
  }, [pathname, session, profile]);

  return null;
}
