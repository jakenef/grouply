import ConfirmEmail from "@/app-components/onboarding/ConfirmEmail";
import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Login = () => {
  const { sendSignUpOTP, verifyOTP } = useAuth();
  const utils = trpc.useUtils();
  const insets = useSafeAreaInsets();

  const handleSuccess = async () => {
    // After OTP is verified, check if user exists in database
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
        behavior="padding"
        keyboardVerticalOffset={insets.top}
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
            Enter your email to discover events
          </Text>

          {/* Email/OTP flow component */}
          <ConfirmEmail
            onSendOTP={sendSignUpOTP}
            onVerifyOTP={verifyOTP}
            onSuccess={handleSuccess}
            sendButtonLabel="Verify Email"
          />

          <View className="w-full mt-8 flex-row justify-center items-center">
            <Text className="text-s text-muted">Already have an account? </Text>
            <Text
              className="text-s text-primary font-semibold"
              onPress={() => router.replace("/(auth)/LoginEmail")}
            >
              Log In
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;
