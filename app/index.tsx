import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function Index() {
  const { session, isLoading } = useAuth();
  const userExistsQuery = trpc.users.checkUserExists.useQuery(undefined, {
    enabled: !!session,
  });
  
  // Also check subscription status
  const subscriptionQuery = trpc.subscriptions.getStatus.useQuery(undefined, {
    enabled: !!session && !!userExistsQuery.data?.exists,
  });

  const isCheckingAuth = 
    isLoading || 
    (session && userExistsQuery.isLoading) || 
    (session && userExistsQuery.data?.exists && subscriptionQuery.isLoading);

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

  // After loading, redirect based on authentication, user status, and subscription
  if (!session) {
    // No authentication, go to landing page
    return <Redirect href="/(auth)/LandingPage" />;
  } else if (!userExistsQuery.data?.exists) {
    // Authenticated but no user profile - go to onboarding
    return <Redirect href="/(auth)/AboutYouSetup" />;
  } else if (!subscriptionQuery.data?.isActive) {
    // Authenticated and profile exists, but no active subscription - go to paywall
    return <Redirect href="/(auth)/Paywall" />;
  } else {
    // Authenticated, profile exists, and subscribed - go to home
    return <Redirect href="/(app)/Home" />;
  }
}
