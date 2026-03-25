import { trpc } from "@/lib/trpc";
import { useIAPClient } from "@/lib/useIAPClient";
import type { NormalizedPlan } from "@/lib/useSubscriptionPlans";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import type { Purchase } from "react-native-iap";

type VerifySource = "listener" | "restore";

export function usePaywallPurchaseFlow() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const verifyReceiptMutation = trpc.subscriptions.verifyReceipt.useMutation();

  const [isProcessing, setIsProcessing] = useState(false);
  const seenIosTxKeysRef = useRef<Set<string>>(new Set());

  const isJwtShape = (value: unknown) => {
    return (
      typeof value === "string" &&
      value.length > 20 &&
      value.split(".").length === 3
    );
  };

  const extractIosJwsCandidate = (purchase: Purchase) => {
    const p = purchase as any;
    const candidates = [
      p.jwsRepresentation,
      p.signedTransactionInfo,
      p.signedTransactionJWS,
      p.purchaseToken,
    ];

    return candidates.find((candidate) => isJwtShape(candidate)) ?? null;
  };

  const { requestPurchase, finishTransaction, getAvailablePurchases } =
    useIAPClient({
      onPurchaseSuccess: async (purchase) => {
        const result = await handleVerifyPurchase(purchase, "listener");

        if (result.verified && !result.isDuplicate) {
          router.replace("/(app)/Home");
          return;
        }

        setIsProcessing(false);
      },
      onPurchaseError: () => {
        setIsProcessing(false);
      },
    });

  const resolveIosPurchaseWithJws = async (purchase: Purchase) => {
    const currentJws = extractIosJwsCandidate(purchase);
    if (currentJws) {
      return purchase;
    }

    try {
      const purchasesRaw = await getAvailablePurchases();
      const purchases: Purchase[] = Array.isArray(purchasesRaw)
        ? purchasesRaw
        : [];
      const txId = purchase.transactionId ?? null;

      const txMatch = purchases.find(
        (p) => p.transactionId === txId && !!extractIosJwsCandidate(p),
      );
      if (txMatch) {
        return txMatch;
      }

      const productMatch = purchases.find(
        (p) =>
          p.productId === purchase.productId && !!extractIosJwsCandidate(p),
      );
      if (productMatch) {
        return productMatch;
      }
    } catch {
      return null;
    }

    return null;
  };

  const handleVerifyPurchase = async (
    purchase: Purchase,
    source: VerifySource,
  ): Promise<{ verified: boolean; isDuplicate: boolean }> => {
    if (!purchase) return { verified: false, isDuplicate: false };

    const isAndroid = Platform.OS === "android";
    let purchaseForVerification = purchase;

    if (Platform.OS === "ios") {
      const resolvedPurchase = await resolveIosPurchaseWithJws(purchase);
      if (!resolvedPurchase) {
        return { verified: false, isDuplicate: false };
      }
      purchaseForVerification = resolvedPurchase;
    }

    const iosTxKey =
      Platform.OS === "ios"
        ? (purchaseForVerification.transactionId ??
          (purchaseForVerification as any).originalTransactionIdentifierIOS ??
          (purchaseForVerification as any).originalTransactionId ??
          null)
        : null;

    if (Platform.OS === "ios" && iosTxKey) {
      if (seenIosTxKeysRef.current.has(iosTxKey)) {
        return { verified: true, isDuplicate: true };
      }
      seenIosTxKeysRef.current.add(iosTxKey);
    }

    try {
      await verifyReceiptMutation.mutateAsync({
        platform: isAndroid ? "ANDROID" : "IOS",
        productId: purchaseForVerification.productId,
        transactionId: purchaseForVerification.transactionId ?? null,
        purchaseToken: isAndroid
          ? (purchaseForVerification as any).purchaseToken
          : null,
        transactionReceipt: null,
        signedTransactionJWS: !isAndroid
          ? extractIosJwsCandidate(purchaseForVerification)
          : null,
      });

      await Promise.all([
        utils.subscriptions.getStatus.invalidate(),
        utils.users.getMyUser.invalidate(),
      ]);
    } catch {
      if (Platform.OS === "ios" && iosTxKey) {
        seenIosTxKeysRef.current.delete(iosTxKey);
      }
      return { verified: false, isDuplicate: false };
    }

    try {
      await finishTransaction({ purchase: purchaseForVerification });
    } catch {
      // no-op: verification already succeeded and entitlement is updated
    }

    return { verified: true, isDuplicate: false };
  };

  const subscribe = async (selectedPlan: NormalizedPlan | null) => {
    if (!selectedPlan) return;

    setIsProcessing(true);

    try {
      const androidOfferToken =
        Platform.OS === "android" ? selectedPlan.offerToken?.trim() : null;

      if (Platform.OS === "android" && !androidOfferToken) {
        Alert.alert(
          "Plan Unavailable",
          "This plan is missing its Android offer token. Please refresh and try again.",
        );
        setIsProcessing(false);
        return;
      }

      await requestPurchase({
        request:
          Platform.OS === "android"
            ? {
                google: {
                  skus: [selectedPlan.storeId],
                  subscriptionOffers: [
                    {
                      sku: selectedPlan.storeId,
                      offerToken: androidOfferToken!,
                    },
                  ],
                },
              }
            : {
                apple: {
                  sku: selectedPlan.storeId,
                },
              },
        type: "subs",
      });
    } catch (error: any) {
      setIsProcessing(false);

      if (error?.code === "E_USER_CANCELLED") return;

      Alert.alert("Purchase Failed", error.message || "Something went wrong");
    }
  };

  const restore = async () => {
    setIsProcessing(true);

    try {
      const purchasesRaw = await getAvailablePurchases();
      const purchases: Purchase[] = Array.isArray(purchasesRaw)
        ? purchasesRaw
        : [];

      if (purchases.length === 0) {
        Alert.alert(
          "No Purchases Found",
          "No active purchases were found to restore on this device.",
        );
        return;
      }

      let restored = 0;
      let failed = 0;

      for (const purchase of purchases) {
        try {
          const result = await handleVerifyPurchase(purchase, "restore");
          if (result.verified) {
            restored++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }

      await Promise.all([
        utils.subscriptions.getStatus.invalidate(),
        utils.users.getMyUser.invalidate(),
      ]);

      if (restored > 0) {
        Alert.alert(
          "Restore Complete",
          failed === 0
            ? `Successfully restored your purchase${restored > 1 ? "s" : ""}!`
            : `Restored ${restored} purchase${restored > 1 ? "s" : ""}, but ${failed} failed. If you are missing access, please contact support.`,
          [
            {
              text: "Get Started",
              onPress: () => router.replace("/(app)/Home"),
            },
          ],
        );
      } else {
        Alert.alert(
          "Restore Failed",
          "We could not restore any purchases. If you believe you have an active subscription, please contact support.",
        );
      }
    } catch {
      Alert.alert("Error", "Failed to restore purchases. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    subscribe,
    restore,
  };
}
