import { isLocalDevelopmentMode } from "@/lib/environmentMode";
import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { isEligibleForIntroOfferIOS, useIAP } from "react-native-iap";

const REAL_SUBSCRIPTION_SKUS_IOS = [
  "grouply_subscription_monthly",
  "grouply_subscription_yearly",
];

const REAL_SUBSCRIPTION_SKUS_ANDROID = ["grouply_subscription"];

const SUBSCRIPTION_GROUP_ID = "21977012";

const IOS_EMPTY_SUBSCRIPTION_RETRY_MAX = 3;
const IOS_EMPTY_SUBSCRIPTION_RETRY_DELAY_MS = 900;

const REAL_SUBSCRIPTION_SKUS = Platform.select({
  ios: REAL_SUBSCRIPTION_SKUS_IOS,
  android: REAL_SUBSCRIPTION_SKUS_ANDROID,
  default: [],
});

const MOCK_ANDROID_STORE_ID = "grouply_subscription";

const MOCK_PLANS_ANDROID: NormalizedPlan[] = [
  {
    id: "trial",
    storeId: MOCK_ANDROID_STORE_ID,
    offerToken: "local-offer-token-trial",
    title: "7-Day Free Trial",
    subtitle: "Then $9.99/month",
    price: "Free",
    description: "Try all features for free",
    badge: "BEST FOR NEW USERS",
  },
  {
    id: "monthly",
    storeId: MOCK_ANDROID_STORE_ID,
    offerToken: "local-offer-token-monthly",
    title: "Monthly",
    subtitle: "Billed monthly",
    price: "$9.99",
    description: "Flexible monthly access",
  },
  {
    id: "yearly",
    storeId: MOCK_ANDROID_STORE_ID,
    offerToken: "local-offer-token-yearly",
    title: "Yearly",
    subtitle: "Billed annually",
    price: "$79.99",
    description: "Best value for long-term use",
    badge: "BEST VALUE",
  },
];

const MOCK_PLANS_IOS: NormalizedPlan[] = [
  {
    id: "grouply_subscription_monthly",
    storeId: "grouply_subscription_monthly",
    title: "Monthly",
    subtitle: "Billed monthly",
    price: "$9.99",
    description: "Flexible monthly access",
  },
  {
    id: "grouply_subscription_yearly",
    storeId: "grouply_subscription_yearly",
    title: "Yearly",
    subtitle: "Billed annually",
    price: "$79.99",
    description: "$6.67/month - save 33%",
    badge: "BEST VALUE",
  },
];

type SubscriptionPlansResult = {
  plans: NormalizedPlan[];
  isLoading: boolean;
  error: Error | null;
  isIAPConnected: boolean;
  isMockMode: boolean;
};

export interface NormalizedPlan {
  id: string;
  storeId: string;
  title: string;
  subtitle: string;
  price: string;
  description: string;
  badge?: string;
  offerToken?: string; // Android only
}

const useMockSubscriptionPlans = (): SubscriptionPlansResult => {
  const plans = useMemo((): NormalizedPlan[] => {
    if (Platform.OS === "android") {
      return MOCK_PLANS_ANDROID;
    }

    if (Platform.OS === "ios") {
      return MOCK_PLANS_IOS;
    }

    return [];
  }, []);

  return {
    plans,
    isLoading: false,
    error: null,
    isIAPConnected: true,
    isMockMode: true,
  };
};

const useRealSubscriptionPlans = (): SubscriptionPlansResult => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [iosEmptyRetryCount, setIosEmptyRetryCount] = useState(0);
  const [isIntroOfferEligibleIOS, setIsIntroOfferEligibleIOS] = useState<
    boolean | null
  >(null);
  const [introEligibilityGroupIdIOS, setIntroEligibilityGroupIdIOS] = useState<
    string | null
  >(null);

  const {
    connected: isIAPConnected,
    subscriptions: realSubscriptions,
    fetchProducts: fetchRealProducts,
  } = useIAP();

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      if (
        !isIAPConnected ||
        !REAL_SUBSCRIPTION_SKUS ||
        REAL_SUBSCRIPTION_SKUS.length === 0
      )
        return;

      setIsFetching(true);
      setError(null);
      if (Platform.OS === "ios") {
        setIosEmptyRetryCount(0);
      }

      try {
        await fetchRealProducts({ skus: REAL_SUBSCRIPTION_SKUS, type: "subs" });
      } catch (err: any) {
        console.error("❌ [Real IAP] Error fetching products:", err);
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [isIAPConnected, fetchRealProducts]);

  useEffect(() => {
    let isMounted = true;

    const shouldRetryIOSFetch =
      Platform.OS === "ios" &&
      isIAPConnected &&
      !isFetching &&
      !error &&
      (realSubscriptions?.length ?? 0) === 0 &&
      iosEmptyRetryCount < IOS_EMPTY_SUBSCRIPTION_RETRY_MAX;

    if (!shouldRetryIOSFetch) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsFetching(true);
      setError(null);

      try {
        await fetchRealProducts({ skus: REAL_SUBSCRIPTION_SKUS, type: "subs" });
      } catch (err: any) {
        console.error("❌ [Real IAP] Retry fetch products error:", err);
        if (isMounted) setError(err);
      } finally {
        if (isMounted) {
          setIsFetching(false);
          setIosEmptyRetryCount((count) => count + 1);
        }
      }
    }, IOS_EMPTY_SUBSCRIPTION_RETRY_DELAY_MS);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [
    isIAPConnected,
    isFetching,
    error,
    realSubscriptions,
    iosEmptyRetryCount,
    fetchRealProducts,
  ]);

  useEffect(() => {
    let isMounted = true;

    const resolveIntroEligibility = async () => {
      if (Platform.OS !== "ios") {
        if (isMounted) {
          setIsIntroOfferEligibleIOS(null);
          setIntroEligibilityGroupIdIOS(null);
        }
        return;
      }

      const iosSubscriptions = (realSubscriptions as any[]) ?? [];

      const monthlySubscription = iosSubscriptions.find((product) => {
        const sku = (product?.id ?? product?.productId ?? "")
          .toString()
          .toLowerCase();
        return sku.includes("monthly");
      });

      const directEligibility = monthlySubscription?.isEligibleForIntroOffer;
      if (typeof directEligibility === "boolean") {
        if (isMounted) {
          setIsIntroOfferEligibleIOS(directEligibility);
          setIntroEligibilityGroupIdIOS(null);
        }
        return;
      }

      const groupId =
        monthlySubscription?.subscriptionInfoIOS?.subscriptionGroupId ??
        monthlySubscription?.subscriptionInfoIOS?.subscriptionGroupIdentifier ??
        monthlySubscription?.subscriptionGroupIdIOS ??
        monthlySubscription?.subscriptionGroupIdentifierIOS ??
        SUBSCRIPTION_GROUP_ID;

      if (!groupId) {
        if (isMounted) {
          setIsIntroOfferEligibleIOS(null);
          setIntroEligibilityGroupIdIOS(null);
        }
        return;
      }

      if (isMounted) {
        setIntroEligibilityGroupIdIOS(groupId);
      }

      try {
        const eligible = await isEligibleForIntroOfferIOS(groupId);
        if (isMounted) {
          setIsIntroOfferEligibleIOS(eligible);
        }
      } catch (eligibilityError) {
        console.error(
          "[IAP] Failed to resolve iOS intro-offer eligibility:",
          eligibilityError,
        );
        if (isMounted) {
          setIsIntroOfferEligibleIOS(null);
        }
      }
    };

    resolveIntroEligibility();

    return () => {
      isMounted = false;
    };
  }, [realSubscriptions]);

  const plans = useMemo((): NormalizedPlan[] => {
    if (!realSubscriptions || realSubscriptions.length === 0) return [];

    if (Platform.OS === "ios") {
      const getSku = (product: any): string => {
        return product?.id ?? product?.productId ?? "";
      };

      const isMonthlySku = (sku: string): boolean => {
        return sku.toLowerCase().includes("monthly");
      };

      const isYearlySku = (sku: string): boolean => {
        return sku.toLowerCase().includes("yearly");
      };

      const formatTrialPeriod = (offer: any): string | null => {
        const period = offer?.period;
        const value = period?.value;
        const unit = period?.unit;

        if (!value || !unit) return null;

        const unitLabel = String(unit).toLowerCase();
        return `${value}-${value === 1 ? unitLabel : `${unitLabel}s`}`;
      };

      const getIntroOffer = (product: any): any | null => {
        const standardizedOffers = Array.isArray(product?.subscriptionOffers)
          ? product.subscriptionOffers
          : [];

        const introFromStandardized = standardizedOffers.find(
          (offer: any) => offer?.type === "introductory",
        );

        if (introFromStandardized) return introFromStandardized;

        return product?.subscriptionInfoIOS?.introductoryOffer ?? null;
      };

      const monthlyProduct = (realSubscriptions as any[]).find((p) =>
        isMonthlySku(getSku(p)),
      );
      const yearlyProduct = (realSubscriptions as any[]).find((p) =>
        isYearlySku(getSku(p)),
      );

      const iosPlans = (realSubscriptions as any[]).reduce<NormalizedPlan[]>(
        (acc, p) => {
          const sku = getSku(p);

          if (!sku) {
            console.warn("[IAP] iOS subscription missing id/productId", p);
            return acc;
          }

          const isYearly = isYearlySku(sku);
          const introOffer = !isYearly ? getIntroOffer(p) : null;
          const directEligibility = p?.isEligibleForIntroOffer;
          const resolvedEligibility =
            typeof directEligibility === "boolean"
              ? directEligibility
              : isIntroOfferEligibleIOS;

          let description = isYearly
            ? "Annual access"
            : "Flexible monthly access";

          let subtitle = isYearly ? "Billed annually" : "Billed monthly";
          let badge: string | undefined = isYearly ? "BEST VALUE" : undefined;

          if (isYearly && monthlyProduct && yearlyProduct) {
            const yPrice =
              typeof yearlyProduct.price === "string"
                ? parseFloat(yearlyProduct.price)
                : yearlyProduct.price;
            const mPrice =
              typeof monthlyProduct.price === "string"
                ? parseFloat(monthlyProduct.price)
                : monthlyProduct.price;

            if (yPrice && mPrice) {
              const monthlyEquiv = (yPrice / 12).toLocaleString(undefined, {
                style: "currency",
                currency: yearlyProduct.currency || "USD",
              });
              const savings = Math.round((1 - yPrice / (mPrice * 12)) * 100);
              description = `${monthlyEquiv}/month — save ${savings}%`;
            }
          }

          const hasIntroOffer = !!introOffer;
          const shouldShowTrialOnIOS = hasIntroOffer && resolvedEligibility;

          if (!isYearly && shouldShowTrialOnIOS) {
            const trialPeriod = formatTrialPeriod(introOffer);
            acc.push({
              id: `${sku}:trial`,
              storeId: sku,
              title: trialPeriod ? `${trialPeriod} Free Trial` : "Free Trial",
              subtitle: `Then ${p.localizedPrice ?? p.displayPrice ?? ""}/month`,
              price: "Free",
              description: "Try all features for free",
              badge: "BEST FOR NEW USERS",
            });
          }

          acc.push({
            id: sku,
            storeId: sku,
            title: isYearly ? "Yearly" : "Monthly",
            subtitle,
            price: p.localizedPrice ?? p.displayPrice ?? "",
            description: description,
            badge,
          });

          return acc;
        },
        [],
      );

      return iosPlans.sort((a, b) => {
        const getOrder = (plan: NormalizedPlan): number => {
          if (
            plan.badge === "BEST FOR NEW USERS" ||
            plan.id.includes(":trial")
          ) {
            return 0;
          }

          if (plan.title === "Monthly") {
            return 1;
          }

          if (plan.title === "Yearly") {
            return 2;
          }

          return 3;
        };

        return getOrder(a) - getOrder(b);
      });
    }

    // Android
    return (realSubscriptions as any[])
      .flatMap((product) => {
        const productId = product.productId || product.id;
        const offers = product.subscriptionOfferDetailsAndroid || [];

        return offers.map((offer: any) => {
          const phases = offer.pricingPhases?.pricingPhaseList || [];
          const basePlanId = offer.basePlanId || "";
          const hasTrial = phases.length > 1;

          if (!productId) {
            console.error("❌ Missing productId:", product);
            return null;
          }

          const offerToken = offer.offerToken ?? offer.offerTokenAndroid;

          if (!offerToken) {
            console.error("❌ Missing offerToken:", offer);
          }

          if (basePlanId.includes("monthly") && hasTrial) {
            return {
              id: "trial",
              storeId: productId,
              offerToken,
              title: "7-Day Free Trial",
              subtitle: `Then ${phases[1].formattedPrice}/month`,
              price: "Free",
              description: "Try all features for free",
              badge: "BEST FOR NEW USERS",
            };
          }

          if (basePlanId.includes("monthly")) {
            return {
              id: "monthly",
              storeId: productId,
              offerToken,
              title: "Monthly",
              subtitle: "Billed monthly",
              price: phases[0].formattedPrice,
              description: "Flexible monthly access",
            };
          }

          if (basePlanId.includes("yearly")) {
            return {
              id: "yearly",
              storeId: productId,
              offerToken,
              title: "Yearly",
              subtitle: "Billed annually",
              price: phases[0].formattedPrice,
              description: "Best value for long-term use",
              badge: "BEST VALUE",
            };
          }

          return null;
        });
      })
      .filter((p): p is NormalizedPlan => p !== null);
  }, [realSubscriptions, isIntroOfferEligibleIOS, introEligibilityGroupIdIOS]);

  const hasPendingIOSRetry =
    Platform.OS === "ios" &&
    isIAPConnected &&
    !error &&
    !isFetching &&
    (realSubscriptions?.length ?? 0) === 0 &&
    iosEmptyRetryCount < IOS_EMPTY_SUBSCRIPTION_RETRY_MAX;

  const shouldShowPlansLoading =
    plans.length === 0 &&
    (isFetching || (!isIAPConnected && !error) || hasPendingIOSRetry);

  return {
    plans,
    isLoading: shouldShowPlansLoading,
    error,
    isIAPConnected,
    isMockMode: false,
  };
};

const useSubscriptionPlansImpl = isLocalDevelopmentMode()
  ? useMockSubscriptionPlans
  : useRealSubscriptionPlans;

export function useSubscriptionPlans(): SubscriptionPlansResult {
  return useSubscriptionPlansImpl();
}
