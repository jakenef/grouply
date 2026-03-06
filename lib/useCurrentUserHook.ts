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
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent refetch during navigation
  });

  if (!user) {
    return { user: null, isLoading: authLoading, error: null };
  }

  return { user: userData, isLoading: authLoading || profileLoading, error };
}
