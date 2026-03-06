import { useAuth } from "./auth";
import { trpc } from "./trpc";

export function useCurrentUser() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    data: userData,
    isLoading: profileLoading,
    error,
  } = trpc.users.getMyUser.useQuery(undefined, {
    enabled: !!user,
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 5000);
      console.log(
        `[useCurrentUser] Retry attempt ${attemptIndex + 1} in ${delay}ms`,
      );
      return delay;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent refetch during navigation
  });

  // Log errors when they occur
  if (error) {
    console.error("[useCurrentUser] Failed to fetch user profile:", error);
  }

  if (!user) {
    return { user: null, isLoading: authLoading, error: null };
  }

  return { user: userData, isLoading: authLoading || profileLoading, error };
}
