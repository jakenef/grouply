import { useAuth } from "@/lib/auth";
import { isLocalDevelopmentMode } from "@/lib/environmentMode";
import { trpc } from "@/lib/trpc";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { getAvailablePurchases, initConnection } from "react-native-iap";

const SUBSCRIPTION_PRODUCT_IDS = [
  "grouply_subscription_monthly",
  "grouply_subscription_yearly",
  "grouply_subscription",
];

export default function Index() {
  const { session, isLoading } = useAuth();
  const userExistsQuery = trpc.users.checkUserExists.useQuery(undefined, {
    enabled: !!session,
  });

  // Also check subscription status
  const subscriptionQuery = trpc.subscriptions.getStatus.useQuery(undefined, {
    enabled:
      !!session &&
      !!userExistsQuery.data?.exists &&
      !!userExistsQuery.data?.hasCompletedPreferences,
    staleTime: 0,
    refetchOnMount: "always",
  });

  // When getStatus resolves to inactive, check the IAP queue for a pending renewal
  // before routing to Paywall. Keeps the splash up during the check so the user
  // never sees the Paywall flicker if a renewal is already in flight.
  const isDefinitelyInactive = subscriptionQuery.data?.isActive === false;
  const [pendingRenewalState, setPendingRenewalState] = useState<
    "unchecked" | "pending" | "none"
  >("unchecked");

  useEffect(() => {
    if (!isDefinitelyInactive || isLocalDevelopmentMode()) {
      setPendingRenewalState("none");
      return;
    }

    let cancelled = false;

    const checkPending = async () => {
      try {
        await initConnection();
        const purchases = await getAvailablePurchases();
        if (!cancelled) {
          const hasPending = purchases.some((p) =>
            SUBSCRIPTION_PRODUCT_IDS.includes(p.productId),
          );
          setPendingRenewalState(hasPending ? "pending" : "none");
        }
      } catch {
        if (!cancelled) setPendingRenewalState("none");
      }
    };

    checkPending();
    return () => {
      cancelled = true;
    };
  }, [isDefinitelyInactive]);

  const isCheckingAuth =
    isLoading ||
    (session && userExistsQuery.isLoading) ||
    (session &&
      userExistsQuery.data?.exists &&
      userExistsQuery.data?.hasCompletedPreferences &&
      (subscriptionQuery.isLoading ||
        subscriptionQuery.isFetching ||
        // Hold here while we confirm whether a pending renewal exists
        (isDefinitelyInactive && pendingRenewalState !== "none")));

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
  } else if (!userExistsQuery.data?.hasCompletedPreferences) {
    // Authenticated and profile exists, but onboarding preferences are incomplete
    return <Redirect href="/(auth)/PreferencesSetup" />;
  } else if (!subscriptionQuery.data?.isActive) {
    // Authenticated and profile exists, but no active subscription - go to paywall
    return <Redirect href="/(auth)/Paywall" />;
  } else {
    // Authenticated, profile exists, and subscribed - go to home
    return <Redirect href="/(app)/Home" />;
  }
}
