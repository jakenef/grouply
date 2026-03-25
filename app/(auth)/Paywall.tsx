import GrouplyButton from "@/app-components/shared/GrouplyButton";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";
import { usePaywallPurchaseFlow } from "@/lib/usePaywallPurchaseFlow";
import {
  NormalizedPlan,
  useSubscriptionPlans,
} from "@/lib/useSubscriptionPlans";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const Paywall = () => {
  const router = useRouter();
  const { signOut } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<NormalizedPlan | null>(null);
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);
  const { isProcessing, subscribe, restore } = usePaywallPurchaseFlow();

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
        onPress={() => subscribe(selectedPlan)}
        isLoading={isProcessing}
        disabled={isLoading || !selectedPlan}
      />

      <View className="mt-4 mb-8">
        <Pressable
          onPress={restore}
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
        {/* Logout */}
        <View className="mt-4 items-center">
          <Pressable
            onPress={async () => {
              await signOut();
              router.replace("/(auth)/LandingPage");
            }}
          >
            <Text className="text-primary text-xs font-medium">Log Out</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default Paywall;
