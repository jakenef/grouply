import EmailAndPassword from "@/app-components/onboarding/EmailAndPassword";
import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DemoLogin = () => {
  const { signInWithPassword } = useAuth();
  const utils = trpc.useUtils();
  const insets = useSafeAreaInsets();

  const handleSuccess = async () => {
    try {
      const result = await utils.client.users.checkUserExists.query();
      if (result.exists) {
        router.replace("/(app)/Home");
      } else {
        router.replace("/(auth)/AboutYouSetup");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      // Default to setup if we can't check
      router.replace("/(auth)/AboutYouSetup");
    }
  };

  return (
    <View className="flex-1 bg-background py-4">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        <ScrollView className="flex-1 px-8">
          <View className="items-center">
            <Text className="text-5xl font-bold text-primary mt-16">
              Grouply
            </Text>
          </View>

          {/* Welcome back header */}
          <Text className="text-3xl font-bold text-foreground mt-12">
            Welcome!
          </Text>

          {/* Login subheader */}
          <Text className="text-base text-muted mt-2">
            Enter the provided demo login to continue
          </Text>

          {/* Email/OTP flow component */}
          <EmailAndPassword
            buttonLabel="Login"
            onButtonPress={signInWithPassword}
            onSuccess={handleSuccess}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default DemoLogin;
