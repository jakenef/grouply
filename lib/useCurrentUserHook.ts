import { useAuth } from "./auth";
import { trpc } from "./trpc";

export function useCurrentUser() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    data: userData,
    isLoading: profileLoading,
    error,
  } = trpc.users.getMyProfile.useQuery(
    { authId: user?.id ?? "" },
    { enabled: !!user, retry: false }
  );

  if (!user) {
    return { user: null, isLoading: authLoading, error: null };
  }

  return { user: userData, isLoading: authLoading || profileLoading, error };
}
