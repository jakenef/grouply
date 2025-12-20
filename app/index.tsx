import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function Index() {
  const { session, isLoading } = useAuth();
  const userExistsQuery = trpc.users.checkUserExists.useQuery(undefined, {
    // Only run the query if we have a session
    enabled: !!session,
  });

  const isCheckingAuth = isLoading || (session && userExistsQuery.isLoading);

  // Hide splash screen when auth check is complete
  useEffect(() => {
    if (!isCheckingAuth) {
      SplashScreen.hideAsync();
    }
  }, [isCheckingAuth]);

  // While checking auth status, keep splash screen visible
  if (isCheckingAuth) {
    return null; // Splash screen is showing, don't render anything
  }

  // After loading, redirect based on authentication and user status
  if (!session) {
    // No authentication, go to landing page
    return <Redirect href="/(auth)/LandingPage" />;
  } else if (userExistsQuery.data?.exists) {
    // Authenticated and user exists in database - go to home
    return <Redirect href="/(app)/Home" />;
  } else {
    // Authenticated but no user profile - go to onboarding
    return <Redirect href="/(auth)/AboutYouSetup" />;
  }
}
