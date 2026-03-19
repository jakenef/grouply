import GrouplyButton from "@/app-components/shared/GrouplyButton";
import { colors } from "@/lib/theme";
import { trpc } from "@/lib/trpc";
import {
  NormalizedPlan,
  useSubscriptionPlans,
} from "@/lib/useSubscriptionPlans";
import { Ionicons } from "@expo/vector-icons";
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

const Paywall = () => {
  const [selectedPlan, setSelectedPlan] = useState<NormalizedPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { requestPurchase } = useIAP({
    onPurchaseSuccess: (purchase) => {
      console.log("🎉 SUCCESS:", purchase);
      setIsProcessing(false);
    },
    onPurchaseError: (error) => {
      console.error("❌ ERROR:", error);
      setIsProcessing(false);
    },
  });

  // Use new hook for data
  const { plans, isLoading: isPlansLoading } = useSubscriptionPlans();

  const verifyReceiptMutation = trpc.subscriptions.verifyReceipt.useMutation();

  // Set default selection once plans load
  useEffect(() => {
    if (plans.length > 0 && !selectedPlan) {
      const defaultPlan =
        plans.find((p) => p.badge === "BEST FOR NEW USERS") ||
        plans.find((p) => p.title === "Monthly") ||
        plans[0];
      setSelectedPlan(defaultPlan);
    }
  }, [plans, selectedPlan]);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    console.log("DEBUG PLAN:", selectedPlan);

    setIsProcessing(true);

    try {
      const purchase = await requestPurchase({
        request:
          Platform.OS === "android"
            ? {
                google: {
                  skus: [selectedPlan.storeId],
                  subscriptionOffers: [
                    {
                      sku: selectedPlan.storeId,
                      offerToken: selectedPlan.offerToken!,
                    },
                  ],
                },
              }
            : {
                ios: {
                  sku: selectedPlan.storeId,
                },
              },
        type: "subs",
      });

      console.log("Purchase triggered");
    } catch (error: any) {
      console.error("❌ Purchase error:", error);

      if (error?.code === "E_USER_CANCELLED") return;

      Alert.alert("Purchase Failed", error.message || "Something went wrong");
    }
  };

  const handleRestore = () => {
    Alert.alert("Restore Purchase", "Searching for existing subscriptions...");
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
            <TouchableOpacity
              key={`${plan.storeId}-${plan.id}`}
              onPress={() => setSelectedPlan(plan)}
              className={`mb-4 p-4 rounded-2xl border-2 ${
                selectedPlan?.id === plan.id
                  ? "border-primary bg-accent"
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
                      selectedPlan?.id === plan.id
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={24}
                    color={
                      selectedPlan?.id === plan.id
                        ? colors.primary
                        : colors.muted.DEFAULT
                    }
                    style={{ marginTop: 4 }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Main CTA */}
      <GrouplyButton
        label={
          isProcessing
            ? "Processing..."
            : selectedPlan
              ? selectedPlan.id === "trial"
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
