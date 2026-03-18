import GrouplyButton from "@/app-components/shared/GrouplyButton";
import { useIAPMock } from "@/lib/iap";
import { trpc } from "@/lib/trpc";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useIAP } from "react-native-iap";

const REAL_SUBSCRIPTION_SKUS = [
  "grouply_subscription_monthly",
  "grouply_subscription_yearly",
];

const Paywall = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>(
    "grouply_premium_trial",
  );
  const [isLoading, setIsLoading] = useState(false);

  // Keep mock IAP for buttons and logic
  const { requestPurchase, finishTransaction } = useIAPMock();

  // Use real IAP ONLY for logging
  const {
    connected: isIAPConnected,
    subscriptions: realSubscriptions,
    fetchProducts: fetchRealProducts,
  } = useIAP();

  const verifyReceiptMutation = trpc.subscriptions.verifyReceipt.useMutation();

  // Log real subscriptions when connected
  useEffect(() => {
    if (isIAPConnected) {
      console.log(
        "🔍 [Real IAP] Connected. Fetching subscriptions for logging...",
      );
      fetchRealProducts({ skus: REAL_SUBSCRIPTION_SKUS, type: "subs" }).catch(
        (err) => {
          console.error("❌ [Real IAP] Error fetching products:", err);
        },
      );
    }
  }, [isIAPConnected, fetchRealProducts]);

  useEffect(() => {
    if (realSubscriptions.length > 0) {
      console.log(
        "✅ [Real IAP] Subscriptions Fetched:",
        JSON.stringify(realSubscriptions, null, 2),
      );
    }
  }, [realSubscriptions]);

  const plans = [
    {
      id: "grouply_premium_trial",
      title: "7-Day Free Trial",
      subtitle: "Then $7.99/month",
      price: "Free",
      description: "Try all features for free",
      badge: "BEST FOR NEW USERS",
    },
    {
      id: "grouply_premium_monthly",
      title: "Monthly",
      subtitle: "Billed monthly",
      price: "$7.99",
      description: "Flexible monthly access",
    },
    {
      id: "grouply_premium_yearly",
      title: "Yearly",
      subtitle: "Billed annually",
      price: "$69.99",
      description: "$5.99/month — save 20%",
      badge: "BEST VALUE",
    },
  ];

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const { transactionId, productId } = await requestPurchase({
        sku: selectedPlan,
      });

      // After "purchase", verify with our backend
      const result = await verifyReceiptMutation.mutateAsync({
        receipt: `mock_receipt_${selectedPlan}_${transactionId}`,
        platform: Platform.OS.toUpperCase() as "IOS" | "ANDROID",
      });

      if (result.hasAccess) {
        await finishTransaction({ transactionId });
        Alert.alert("Success!", "Your subscription is now active.", [
          { text: "Let's Go!", onPress: () => router.replace("/(app)/Home") },
        ]);
      } else {
        throw new Error("Verification failed: No access granted.");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      Alert.alert(
        "Subscription Failed",
        error.message || "There was an error processing your subscription.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = () => {
    Alert.alert("Restore Purchase", "Searching for existing subscriptions...");
    // Mock restore logic
    setTimeout(() => {
      Alert.alert(
        "No Purchases Found",
        "We couldn't find any active subscriptions for this account.",
      );
    }, 1500);
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
              <Ionicons name={feature.icon as any} size={22} color="#4f47e5" />
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
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            activeOpacity={0.7}
            onPress={() => setSelectedPlan(plan.id)}
            className={`mb-4 p-4 rounded-2xl border-2 ${
              selectedPlan === plan.id
                ? "border-primary bg-accent/20"
                : "border-gray-100 bg-white"
            }`}
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
                    selectedPlan === plan.id
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={24}
                  color={selectedPlan === plan.id ? "#4f47e5" : "#d1d5db"}
                  style={{ marginTop: 4 }}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main CTA */}
      <GrouplyButton
        label={
          isLoading
            ? "Processing..."
            : selectedPlan === "grouply_premium_trial"
              ? "Try Free & Subscribe"
              : `Subscribe for ${
                  plans.find((p) => p.id === selectedPlan)?.price
                }`
        }
        variant="primary"
        size="large"
        fullWidth
        onPress={handleSubscribe}
        isLoading={isLoading}
        disabled={isLoading}
      />

      <View className="mt-4 mb-8">
        <TouchableOpacity onPress={handleRestore}>
          <Text className="text-center text-primary font-semibold">
            Already Subscribed? Restore Purchase
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legal Stuff */}
      <View className="items-center mb-10">
        <Text className="text-xs text-muted text-center leading-5 px-4">
          Cancel anytime via your store provider. Subscription will
          automatically renew unless canceled at least 24 hours before the end
          of the current period. Your account will be charged for renewal within
          24 hours prior to the end of the current period.
        </Text>
        <View className="flex-row mt-4 justify-center">
          <TouchableOpacity
            onPress={() =>
              openLink("https://grouply.carrd.co/#termsandconditions")
            }
          >
            <Text className="text-primary text-xs font-medium mx-3">
              Terms and Conditions
            </Text>
          </TouchableOpacity>
          <Text className="text-muted text-xs">•</Text>
          <TouchableOpacity
            onPress={() => openLink("https://grouply.carrd.co/#privacypolicy")}
          >
            <Text className="text-primary text-xs font-medium mx-3">
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Paywall;
