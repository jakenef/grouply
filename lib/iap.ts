import { Platform } from "react-native";

export interface Product {
  productId: string;
  price: string;
  currency: string;
  title: string;
  description: string;
  localizedPrice: string;
}

export interface Subscription extends Product {
  subscriptionPeriodNumberIOS?: string;
  subscriptionPeriodUnitIOS?: string;
  introductoryPrice?: string;
  introductoryPricePaymentModeIOS?: string;
  introductoryPriceNumberOfPeriodsIOS?: string;
  introductoryPriceSubscriptionPeriodIOS?: string;
  subscriptionOfferDetails?: {
    offerToken: string;
    pricingPhases: {
      pricingPhaseList: {
        priceAmountMicros: string;
        billingPeriod: string;
        billingCycleCount: number;
        recurrenceMode: number;
      }[];
    };
  }[];
}

const MOCK_PRODUCTS: Subscription[] = [
  {
    productId: "grouply_premium_monthly",
    price: "7.99",
    currency: "USD",
    title: "Monthly Premium",
    description: "Full access to all Grouply features monthly",
    localizedPrice: "$7.99",
  },
  {
    productId: "grouply_premium_yearly",
    price: "59.99",
    currency: "USD",
    title: "Yearly Premium",
    description: "Full access to all Grouply features yearly (best value)",
    localizedPrice: "$59.99",
  },
  {
    productId: "grouply_premium_trial",
    price: "0.00",
    currency: "USD",
    title: "7-Day Free Trial",
    description: "Try all premium features free for 7 days",
    localizedPrice: "Free",
    introductoryPrice: "0.00",
  },
];

export const useIAPMock = () => {
  const getProducts = async (skus: string[]): Promise<Subscription[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_PRODUCTS.filter((p) => skus.includes(p.productId));
  };

  const requestPurchase = async ({
    sku,
  }: {
    sku: string;
  }): Promise<{ transactionId: string; productId: string }> => {
    console.log(`[IAP Mock] Requesting purchase for: ${sku}`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      transactionId: `mock_tx_${Math.random().toString(36).substring(7)}`,
      productId: sku,
    };
  };

  const finishTransaction = async ({
    transactionId,
  }: {
    transactionId: string;
  }) => {
    console.log(`[IAP Mock] Finishing transaction: ${transactionId}`);
    return Promise.resolve();
  };

  return {
    getProducts,
    requestPurchase,
    finishTransaction,
    connected: true,
  };
};
