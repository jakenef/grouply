import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import React, { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GrouplyButton from "../../components/GrouplyButton";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const { sendOTP, verifyOTP } = useAuth();

  // Test calling a protected endpoint
  const { data: profile, error } = trpc.users.getMyProfile.useQuery(undefined, {
    enabled: false, // Don't auto-run
  });

  const handleSendOTP = async () => {
    const result = await sendOTP(email);
    if (result.error) {
      Alert.alert("Error", result.error.message);
    } else {
      Alert.alert("Success", "Check your email for the OTP code!");
      setStep("otp");
    }
  };

  const handleVerifyOTP = async () => {
    const result = await verifyOTP(email, otp);
    if (result.error) {
      Alert.alert("Error", result.error.message);
    } else {
      Alert.alert("Success", "Logged in!");
    }
  };

  const {
    data: users,
    isLoading,
    error: PublicError,
  } = trpc.users.getPublicProfiles.useQuery({
    limit: 4,
  });

  return (
    <SafeAreaView className="flex-1 bg-background-darker">
      <View className="flex-1 px-8">
        <View className="items-center">
          <Text className="text-5xl font-bold text-primary mt-16">Grouply</Text>
        </View>

        {/* Welcome back header */}
        <Text className="text-3xl font-bold text-foreground mt-12">
          Welcome Back! {isLoading ? "loading..." : ""}
          {users && users.length}
        </Text>

        {/* Login subheader */}
        <Text className="text-base text-muted mt-2">
          Login to continue discovering events
        </Text>

        {/* Email input field */}
        <View className="w-full mt-12">
          <Text className="text-m text-muted-darker mb-2 ml-1">Email</Text>
          <TextInput
            className="w-full h-14 bg-white rounded-lg px-4 text-foreground border-border border"
            placeholder="you@email.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Login button */}
        <View className="w-full mt-6">
          <GrouplyButton
            label="Log In"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSendOTP}
          />
        </View>
        <View className="w-full mt-auto flex-row justify-center items-center">
          <Text className="text-s text-muted">Don't have an account? </Text>
          <Text
            className="text-s text-primary font-semibold"
            onPress={() => console.log("Navigate to register")}
          >
            Sign Up
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;
