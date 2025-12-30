import { useAuth } from "@/lib/auth";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmEmail from "../../app-components/onboarding/ConfirmEmail";

const Login = () => {
  const { sendLoginOTP, verifyOTP } = useAuth();

  const handleSuccess = () => {
    router.replace("/(app)/Home");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-8">
        <View className="items-center">
          <Text className="text-5xl font-bold text-primary mt-16">Grouply</Text>
        </View>

        {/* Welcome back header */}
        <Text className="text-3xl font-bold text-foreground mt-12">
          Welcome Back!
        </Text>

        {/* Login subheader */}
        <Text className="text-base text-muted mt-2">
          Login to continue discovering events
        </Text>

        {/* Email/OTP flow component */}
        <ConfirmEmail
          onSendOTP={sendLoginOTP}
          onVerifyOTP={verifyOTP}
          onSuccess={handleSuccess}
          sendButtonLabel="Log In"
        />

        <View className="w-full mt-auto flex-row justify-center items-center">
          <Text className="text-s text-muted">Don't have an account? </Text>
          <Text
            className="text-s text-primary font-semibold"
            onPress={() => router.replace("/(auth)/SignupEmail")}
          >
            Sign Up
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;
