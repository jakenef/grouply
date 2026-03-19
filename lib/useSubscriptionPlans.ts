import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { useIAP, ProductSubscription, SubscriptionOffer } from "react-native-iap";

const REAL_SUBSCRIPTION_SKUS_IOS = [
  "grouply_subscription_monthly",
  "grouply_subscription_yearly",
];

const REAL_SUBSCRIPTION_SKUS_ANDROID = ["grouply_subscription"];

const REAL_SUBSCRIPTION_SKUS = Platform.select({
  ios: REAL_SUBSCRIPTION_SKUS_IOS,
  android: REAL_SUBSCRIPTION_SKUS_ANDROID,
  default: [],
});

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

export function useSubscriptionPlans() {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    connected: isIAPConnected,
    subscriptions: realSubscriptions,
    fetchProducts: fetchRealProducts,
  } = useIAP();

  useEffect(() => {
    let isMounted = true;
    
    const loadProducts = async () => {
      if (!isIAPConnected || !REAL_SUBSCRIPTION_SKUS || REAL_SUBSCRIPTION_SKUS.length === 0) return;
      
      setIsFetching(true);
      setError(null);
      
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

  const plans = useMemo((): NormalizedPlan[] => {
    if (!realSubscriptions || realSubscriptions.length === 0) return [];

    if (Platform.OS === "ios") {
      const monthlyProduct = (realSubscriptions as any[]).find((p) =>
        p.productId.includes("monthly"),
      );
      const yearlyProduct = (realSubscriptions as any[]).find((p) =>
        p.productId.includes("yearly"),
      );

      return (realSubscriptions as any[])
        .map((p) => {
          const isYearly = p.productId.includes("yearly");
          let description = isYearly ? "Annual access" : "Flexible monthly access";

          if (isYearly && monthlyProduct && yearlyProduct) {
            const yPrice = typeof yearlyProduct.price === 'string' ? parseFloat(yearlyProduct.price) : yearlyProduct.price;
            const mPrice = typeof monthlyProduct.price === 'string' ? parseFloat(monthlyProduct.price) : monthlyProduct.price;

            if (yPrice && mPrice) {
              const monthlyEquiv = (yPrice / 12).toLocaleString(undefined, {
                style: "currency",
                currency: yearlyProduct.currency || "USD",
              });
              const savings = Math.round((1 - yPrice / (mPrice * 12)) * 100);
              description = `${monthlyEquiv}/month — save ${savings}%`;
            }
          }

          return {
            id: p.productId,
            storeId: p.productId,
            title: isYearly ? "Yearly" : "Monthly",
            subtitle: isYearly ? "Billed annually" : "Billed monthly",
            price: p.localizedPrice ?? p.displayPrice ?? "",
            description: description,
            badge: isYearly ? "BEST VALUE" : undefined,
          };
        })
        .sort((a, b) => (a.title === "Monthly" ? -1 : 1));
    }

    // Android
    return (realSubscriptions as ProductSubscription[]).flatMap((product) => {
      const offers: SubscriptionOffer[] = product.subscriptionOffers || [];

      const monthlyOffer = offers.find(
        (o) =>
          o.basePlanIdAndroid?.includes("monthly") &&
          o.pricingPhasesAndroid?.pricingPhaseList.length === 1,
      );
      const yearlyOffer = offers.find((o) =>
        o.basePlanIdAndroid?.includes("yearly"),
      );

      return offers.map((offer) => {
        const phases = offer.pricingPhasesAndroid?.pricingPhaseList || [];
        const basePlanId = offer.basePlanIdAndroid || "";
        const hasTrial = phases.length > 1;

        if (!basePlanId) return null;

        if (basePlanId.includes("monthly") && hasTrial) {
          return {
            id: "trial",
            storeId: product.productId,
            offerToken: offer.offerTokenAndroid || undefined,
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
            storeId: product.productId,
            offerToken: offer.offerTokenAndroid || undefined,
            title: "Monthly",
            subtitle: "Billed monthly",
            price: phases[0].formattedPrice,
            description: "Flexible monthly access",
          };
        }

        if (basePlanId.includes("yearly")) {
          let description = "Best value for long-term use";

          if (monthlyOffer && yearlyOffer && monthlyOffer.pricingPhasesAndroid && yearlyOffer.pricingPhasesAndroid) {
            const yPrice =
              parseFloat(yearlyOffer.pricingPhasesAndroid.pricingPhaseList[0].priceAmountMicros) /
              1000000;
            const mPrice =
              parseFloat(
                monthlyOffer.pricingPhasesAndroid.pricingPhaseList[0].priceAmountMicros,
              ) / 1000000;
            const currencyCode = yearlyOffer.pricingPhasesAndroid.pricingPhaseList[0].priceCurrencyCode;

            if (!isNaN(yPrice) && !isNaN(mPrice)) {
              const monthlyEquiv = (yPrice / 12).toLocaleString(undefined, {
                style: "currency",
                currency: currencyCode,
              });
              const savings = Math.round((1 - yPrice / (mPrice * 12)) * 100);
              description = `${monthlyEquiv}/month — save ${savings}%`;
            }
          }

          return {
            id: "yearly",
            storeId: product.productId,
            offerToken: offer.offerTokenAndroid || undefined,
            title: "Yearly",
            subtitle: "Billed annually",
            price: phases[0].formattedPrice,
            description: description,
            badge: "BEST VALUE",
          };
        }

        return null;
      });
    }).filter(Boolean) as NormalizedPlan[];
  }, [realSubscriptions]);

  return {
    plans,
    isLoading: isFetching || (!isIAPConnected && !error),
    error,
    isIAPConnected,
  };
}
