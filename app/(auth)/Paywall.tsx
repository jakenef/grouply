import GrouplyButton from "@/app-components/shared/GrouplyButton";
import { colors } from "@/lib/theme";
import { trpc } from "@/lib/trpc";
import { useIAPClient } from "@/lib/useIAPClient";
import {
  NormalizedPlan,
  useSubscriptionPlans,
} from "@/lib/useSubscriptionPlans";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { Purchase } from "react-native-iap";

const Paywall = () => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [selectedPlan, setSelectedPlan] = useState<NormalizedPlan | null>(null);
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugEvents, setDebugEvents] = useState<string[]>([]);
  const seenIosTxKeysRef = useRef<Set<string>>(new Set());

  const logIapDebug = (message: string) => {
    if (Platform.OS !== "ios") return;
    // TEMP DEBUG: Keep bounded in-app iOS IAP event logs for faster diagnosis.
    const line = `${new Date().toISOString().split("T")[1]?.slice(0, 8)} ${message}`;
    setDebugEvents((prev) => {
      const next = [...prev, line];
      return next.length > 30 ? next.slice(next.length - 30) : next;
    });
    console.log(`[TEMP DEBUG IAP] ${message}`);
  };

  const verifyReceiptMutation = trpc.subscriptions.verifyReceipt.useMutation();

  const { requestPurchase, finishTransaction, getAvailablePurchases } =
    useIAPClient({
      onPurchaseSuccess: async (purchase) => {
        console.log("🎉 SUCCESS:", purchase);
        const txKey =
          Platform.OS === "ios"
            ? (purchase.transactionId ??
              (purchase as any).originalTransactionIdentifierIOS ??
              (purchase as any).originalTransactionId ??
              "unknown")
            : null;
        logIapDebug(
          `listener success event product=${purchase.productId} tx=${txKey ?? "n/a"} hasJws=${!!(purchase as any).jwsRepresentation}`,
        );
        const success = await handleVerifyPurchase(purchase, "listener");

        if (success) {
          logIapDebug(
            "navigation attempt -> /(app)/Home after listener success",
          );
          Alert.alert("Success", "Welcome to Grouply!", [
            {
              text: "Get Started",
              onPress: () => router.replace("/(app)/Home"),
            },
          ]);
        } else {
          logIapDebug("listener verification failed (alert suppressed)");
        }
        setIsProcessing(false);
      },
      onPurchaseError: (error) => {
        console.error("❌ ERROR:", error);
        logIapDebug(
          `listener error code=${(error as any)?.code ?? "unknown"} message=${(error as any)?.message ?? "unknown"}`,
        );
        setIsProcessing(false);
      },
    });

  const handleVerifyPurchase = async (
    purchase: Purchase,
    source: "listener" | "subscribe" | "restore",
  ) => {
    if (!purchase) return false;

    const isAndroid = Platform.OS === "android";
    const iosTxKey =
      Platform.OS === "ios"
        ? (purchase.transactionId ??
          (purchase as any).originalTransactionIdentifierIOS ??
          (purchase as any).originalTransactionId ??
          null)
        : null;

    if (Platform.OS === "ios" && iosTxKey) {
      if (seenIosTxKeysRef.current.has(iosTxKey)) {
        logIapDebug(
          `skip duplicate session verification tx=${iosTxKey} source=${source}`,
        );
        return true;
      }
      seenIosTxKeysRef.current.add(iosTxKey);
      logIapDebug(`track session tx=${iosTxKey} source=${source}`);
    }

    try {
      logIapDebug(
        `verify start source=${source} tx=${iosTxKey ?? purchase.transactionId ?? "n/a"} hasJws=${!!(purchase as any).jwsRepresentation}`,
      );
      await verifyReceiptMutation.mutateAsync({
        platform: isAndroid ? "ANDROID" : "IOS",
        productId: purchase.productId,
        transactionId: purchase.transactionId ?? null,
        purchaseToken: isAndroid ? (purchase as any).purchaseToken : null,
        transactionReceipt: !isAndroid
          ? (purchase as any).transactionReceipt
          : null,
        signedTransactionJWS: !isAndroid
          ? (purchase as any).jwsRepresentation
          : null,
      });
      logIapDebug(`verify success source=${source}`);

      // Mark entitlement-related queries stale so navigation checks refetch.
      await Promise.all([
        utils.subscriptions.getStatus.invalidate(),
        utils.users.getMyUser.invalidate(),
      ]);
      logIapDebug(`invalidate complete source=${source}`);
    } catch (err) {
      console.error("Verification error:", err);
      logIapDebug(
        `verify failure source=${source} message=${
          err instanceof Error ? err.message : "unknown"
        }`,
      );

      if (Platform.OS === "ios" && iosTxKey) {
        seenIosTxKeysRef.current.delete(iosTxKey);
        logIapDebug(`untrack tx after failure tx=${iosTxKey}`);
      }
      return false;
    }

    try {
      // Finish only after successful verification to avoid granting/ack mismatch.
      await finishTransaction({ purchase });
      logIapDebug(`finishTransaction complete source=${source}`);
    } catch (e) {
      console.warn("Could not finish transaction:", e);
      logIapDebug(
        `finishTransaction failure source=${source} message=${
          e instanceof Error ? e.message : "unknown"
        }`,
      );
    }

    return true;
  };

  // Use new hook for data
  const { plans, isLoading: isPlansLoading } = useSubscriptionPlans();

  // Set default selection once plans load
  useEffect(() => {
    if (plans.length > 0 && !selectedPlan) {
      const defaultPlan =
        plans.find((p) => p.badge === "BEST FOR NEW USERS") ||
        plans.find((p) => p.title === "Monthly") ||
        plans[0];
      setSelectedPlan(defaultPlan);
      setSelectedPlanKey(`${defaultPlan.storeId}:${defaultPlan.id}`);
    }
  }, [plans, selectedPlan]);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    console.log("DEBUG PLAN:", selectedPlan);

    setIsProcessing(true);

    try {
      const androidOfferToken =
        Platform.OS === "android" ? selectedPlan.offerToken?.trim() : null;

      if (Platform.OS === "android" && !androidOfferToken) {
        console.warn("Selected Android plan has no offerToken.", selectedPlan);
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

      console.log("Purchase triggered");
      logIapDebug("subscribe tap triggered requestPurchase");
    } catch (error: any) {
      console.error("❌ Purchase error:", error);
      logIapDebug(
        `subscribe purchase error code=${error?.code ?? "unknown"} message=${error?.message ?? "unknown"}`,
      );

      setIsProcessing(false);

      if (error?.code === "E_USER_CANCELLED") return;

      Alert.alert("Purchase Failed", error.message || "Something went wrong");
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    logIapDebug("restore tap start");
    try {
      const purchasesRaw = await getAvailablePurchases();
      // Explicitly type as Purchase[] and fallback to empty array if undefined/null
      const purchases: Purchase[] = Array.isArray(purchasesRaw)
        ? purchasesRaw
        : [];
      console.log("🔍 Available purchases:", purchases);
      logIapDebug(`restore fetched purchases count=${purchases.length}`);

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
          const success = await handleVerifyPurchase(purchase, "restore");
          if (success) {
            restored++;
          } else {
            failed++;
          }
        } catch (err) {
          console.error(
            "Restore verification failed for purchase:",
            purchase,
            err,
          );
          failed++;
        }
      }

      // Invalidate entitlement-related queries
      await Promise.all([
        utils.subscriptions.getStatus.invalidate(),
        utils.users.getMyUser.invalidate(),
      ]);

      if (restored > 0) {
        logIapDebug("navigation attempt -> /(app)/Home after restore");
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
        logIapDebug("restore completed with zero restored purchases");
        Alert.alert(
          "Restore Failed",
          "We could not restore any purchases. If you believe you have an active subscription, please contact support.",
        );
      }
    } catch (err) {
      console.error("Restore error:", err);
      logIapDebug(
        `restore outer error message=${err instanceof Error ? err.message : "unknown"}`,
      );
      Alert.alert("Error", "Failed to restore purchases. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open link.");
    });
  };

  const features = [
    {
      icon: "sparkles",
      title: "AI Concierge",
      desc: "Find the perfect hangout just by talking with our event assistant.",
    },
    {
      icon: "people",
      title: "Personalized Groups",
      desc: "Our algorithm will match you with others you mesh well with.",
    },
    {
      icon: "calendar",
      title: "Easy Hosting",
      desc: "Have AI generate event details and find others to join you.",
    },
  ];

  const isLoading = isPlansLoading || isProcessing;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="px-6 bg-background"
    >
      {/* Header */}
      <View className="items-center mt-6 mb-8">
        <Text className="text-3xl font-bold text-primary text-center">
          Unlock the Grouply Experience
        </Text>
        <Text className="text-gray-500 text-center mt-2 px-4">
          Join hundreds of others finding their perfect groups with Grouply.
        </Text>
      </View>

      {/* Features List */}
      <View className="mb-10">
        {features.map((feature, index) => (
          <View key={index} className="flex-row items-start mb-5">
            <View className="bg-accent p-2 rounded-full mr-4">
              <Ionicons
                name={feature.icon as any}
                size={22}
                color={colors.primary}
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">
                {feature.title}
              </Text>
              <Text className="text-muted text-sm">{feature.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Pricing Plans */}
      <View className="mb-8">
        {isPlansLoading ? (
          <View className="py-10 items-center">
            <Text className="text-gray-400">Loading plans...</Text>
          </View>
        ) : plans.length === 0 ? (
          <View className="py-10 items-center">
            <Text className="text-gray-400">No plans available.</Text>
          </View>
        ) : (
          plans.map((plan) => (
            <Pressable
              key={`${plan.storeId}-${plan.id}`}
              onPress={() => {
                setSelectedPlan(plan);
                setSelectedPlanKey(`${plan.storeId}:${plan.id}`);
              }}
              className={`mb-4 p-4 rounded-2xl border-2 ${
                selectedPlanKey === `${plan.storeId}:${plan.id}`
                  ? "border-primary bg-accent"
                  : "border-gray-100 bg-white"
              }`}
              style={({ pressed }) => ({ opacity: pressed ? 0.96 : 1 })}
            >
              {plan.badge && (
                <View className="absolute -top-3 right-4 bg-primary px-3 py-1 rounded-full">
                  <Text className="text-white text-[10px] font-bold">
                    {plan.badge}
                  </Text>
                </View>
              )}
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-foreground">
                    {plan.title}
                  </Text>
                  <Text className="text-muted text-sm">{plan.subtitle}</Text>
                  <Text className="text-primary text-xs mt-1 font-medium">
                    {plan.description}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-2xl font-bold text-foreground">
                    {plan.price}
                  </Text>
                  <Ionicons
                    name={
                      selectedPlanKey === `${plan.storeId}:${plan.id}`
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={24}
                    color={
                      selectedPlanKey === `${plan.storeId}:${plan.id}`
                        ? colors.primary
                        : colors.muted.DEFAULT
                    }
                    style={{ marginTop: 4 }}
                  />
                </View>
              </View>
            </Pressable>
          ))
        )}
      </View>

      {/* Main CTA */}
      <GrouplyButton
        label={
          isProcessing
            ? "Processing..."
            : selectedPlan
              ? selectedPlan.id === "trial" ||
                selectedPlan.id.includes(":trial")
                ? "Try Free & Subscribe"
                : `Subscribe for ${selectedPlan.price}`
              : "Select a Plan"
        }
        variant="primary"
        size="large"
        fullWidth
        onPress={handleSubscribe}
        isLoading={isProcessing}
        disabled={isLoading || !selectedPlan}
      />

      <View className="mt-4 mb-8">
        <Pressable
          onPress={handleRestore}
          disabled={isProcessing}
          style={({ pressed }) => ({
            opacity: isProcessing ? 0.55 : pressed ? 0.9 : 1,
          })}
        >
          <Text className="text-center text-primary font-semibold">
            Already Subscribed? Restore Purchase
          </Text>
        </Pressable>
      </View>

      {Platform.OS === "ios" ? (
        <View className="mb-6 rounded-xl border border-gray-300 bg-white p-3">
          <Text className="text-xs font-semibold text-foreground mb-2">
            TEMP DEBUG IAP (iOS)
          </Text>
          {debugEvents.length === 0 ? (
            <Text className="text-[11px] text-muted">No events yet.</Text>
          ) : (
            debugEvents.map((line, idx) => (
              <Text
                key={`${idx}-${line}`}
                className="text-[11px] text-muted mb-1"
              >
                {line}
              </Text>
            ))
          )}
        </View>
      ) : null}

      {/* Legal Stuff */}
      <View className="items-center mb-10">
        <Text className="text-xs text-muted text-center leading-5 px-4">
          Cancel anytime via your store provider. Subscription will
          automatically renew unless canceled at least 24 hours before the end
          of the current period. Your account will be charged for renewal within
          24 hours prior to the end of the current period.
        </Text>
        <View className="flex-row mt-4 justify-center">
          <Pressable
            onPress={() =>
              openLink("https://grouply.carrd.co/#termsandconditions")
            }
          >
            <Text className="text-primary text-xs font-medium mx-3">
              Terms and Conditions
            </Text>
          </Pressable>
          <Text className="text-muted text-xs">•</Text>
          <Pressable
            onPress={() => openLink("https://grouply.carrd.co/#privacypolicy")}
          >
            <Text className="text-primary text-xs font-medium mx-3">
              Privacy Policy
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default Paywall;
