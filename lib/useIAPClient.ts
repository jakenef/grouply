import { Platform } from "react-native";
import {
  getAvailablePurchases as getAvailablePurchasesFromStore,
  Purchase,
  PurchaseError,
  RequestPurchaseProps,
  useIAP,
} from "react-native-iap";
import { isLocalDevelopmentMode } from "./environmentMode";

type IAPHandlers = {
  onPurchaseSuccess: (purchase: Purchase) => Promise<void> | void;
  onPurchaseError: (error: PurchaseError) => void;
};

type RequestPurchaseArgs = RequestPurchaseProps;

type FinishTransactionArgs = {
  purchase: Purchase;
};

export type IAPClient = {
  requestPurchase: (args: RequestPurchaseArgs) => Promise<void>;
  finishTransaction: (args: FinishTransactionArgs) => Promise<void>;
  getAvailablePurchases: () => Promise<Purchase[]>;
};

let mockPurchaseHistory: Purchase[] = [];

const createMockPurchase = (productId: string): Purchase => {
  const now = Date.now();
  const mockToken = `local-token-${productId}-${now}`;

  return {
    productId,
    transactionId: `local-tx-${now}`,
    transactionDate: String(now),
    transactionReceipt: `local-receipt-${productId}-${now}`,
    purchaseToken: mockToken,
    packageNameAndroid: "com.grouply.grouply",
    orderId: `GPA.LOCAL.${now}`,
    signatureAndroid: "local-signature",
    purchaseStateAndroid: 1,
    acknowledgedAndroid: false,
    autoRenewingAndroid: true,
  } as unknown as Purchase;
};

const useMockIAPClient = ({
  onPurchaseSuccess,
  onPurchaseError,
}: IAPHandlers): IAPClient => {
  const requestPurchase: IAPClient["requestPurchase"] = async ({ request }) => {
    try {
      const productId =
        Platform.OS === "android"
          ? (request.google?.skus?.[0] ?? request.android?.skus?.[0])
          : (request.apple?.sku ?? request.ios?.sku);

      if (!productId) {
        throw new Error("Missing product SKU for mock purchase");
      }

      const purchase = createMockPurchase(productId);
      mockPurchaseHistory = [purchase];
      await onPurchaseSuccess(purchase);
    } catch (error) {
      onPurchaseError(error as PurchaseError);
      throw error;
    }
  };

  const finishTransaction: IAPClient["finishTransaction"] = async () => {
    // No-op in local mock mode.
  };

  const getAvailablePurchases: IAPClient["getAvailablePurchases"] =
    async () => {
      return mockPurchaseHistory;
    };

  return {
    requestPurchase,
    finishTransaction,
    getAvailablePurchases,
  };
};

const useRealIAPClient = (handlers: IAPHandlers): IAPClient => {
  const { requestPurchase, finishTransaction } = useIAP({
    onPurchaseSuccess: handlers.onPurchaseSuccess,
    onPurchaseError: handlers.onPurchaseError,
  });

  return {
    requestPurchase,
    finishTransaction,
    getAvailablePurchases: async () => {
      const purchases = await getAvailablePurchasesFromStore();
      return Array.isArray(purchases) ? (purchases as Purchase[]) : [];
    },
  };
};

const useIAPClientImpl = isLocalDevelopmentMode()
  ? useMockIAPClient
  : useRealIAPClient;

export const useIAPClient = (handlers: IAPHandlers): IAPClient => {
  return useIAPClientImpl(handlers);
};
