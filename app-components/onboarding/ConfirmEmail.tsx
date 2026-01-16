import { AuthErrorType, getAuthErrorMessage, parseAuthError } from "@/lib/auth";
import { colors } from "@/lib/theme";
import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import FormField from "../shared/FormField";
import GrouplyButton from "../shared/GrouplyButton";

interface ConfirmEmailProps {
  onSendOTP: (email: string) => Promise<{ data?: any; error?: any }>;
  onVerifyOTP: (
    email: string,
    code: string
  ) => Promise<{ data?: any; error?: any }>;
  onSuccess: () => void;
  sendButtonLabel: string;
}

const ConfirmEmail: React.FC<ConfirmEmailProps> = ({
  onSendOTP,
  onVerifyOTP,
  onSuccess,
  sendButtonLabel,
}) => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      const result = await onSendOTP(email);

      if (result.error) {
        const errorType = parseAuthError(result.error);
        const errorMessage = getAuthErrorMessage(errorType);

        // Rate limited users can proceed to OTP screen
        if (errorType === AuthErrorType.RATE_LIMITED) {
          setStep("otp");
          Alert.alert("Code Already Sent", errorMessage);
        } else {
          // All other errors stay on email screen
          Alert.alert("Error", errorMessage);
        }
      } else {
        // Success - proceed to OTP
        setStep("otp");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode: string) => {
    setIsVerifying(true);
    try {
      const result = await onVerifyOTP(email, otpCode);
      if (result.error) {
        const errorType = parseAuthError(result.error);
        const errorMessage = getAuthErrorMessage(errorType);
        Alert.alert("Error", errorMessage);
      } else {
        onSuccess();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  if (step === "email") {
    return (
      <>
        {/* Email input field */}
        <View className="w-full mt-12">
          <FormField
            label="Email"
            labelClassName="text-m text-muted-darker mb-2 ml-1"
            containerClassName=""
            placeholder="you@email.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            spellCheck={false}
            value={email}
            onChangeText={setEmail}
            style={{
              height: 56, // Equivalent to h-14
              borderRadius: 8, // Equivalent to rounded-lg
              width: "100%",
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: "white",
              color: colors.foreground,
            }}
          />
        </View>

        {/* Send OTP button */}
        <View className="w-full mt-6">
          <GrouplyButton
            label={isLoading ? "Sending..." : sendButtonLabel}
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSendOTP}
            disabled={isLoading || !email.trim()}
            isLoading={isLoading}
          />
        </View>
      </>
    );
  }

  return (
    <>
      {/* OTP input field */}
      <View className="w-full mt-6">
        <Text className="text-m text-muted-darker mb-2 text-center">
          Enter the 6-digit code sent to {email}
        </Text>

        <OtpInput
          numberOfDigits={6}
          focusColor={colors.primary}
          disabled={isVerifying}
          onFilled={(code) => {
            if (!isVerifying) {
              handleVerifyOTP(code);
            }
          }}
          theme={{
            containerStyle: {
              marginVertical: 10,
            },
            pinCodeContainerStyle: {
              backgroundColor: colors.background.DEFAULT,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 8,
              width: 45,
              height: 56,
            },
            focusedPinCodeContainerStyle: {
              borderColor: colors.primary,
              borderWidth: 2,
            },
            focusStickStyle: {
              backgroundColor: colors.primary,
            },
            pinCodeTextStyle: {
              color: colors.foreground,
              fontSize: 20,
              fontWeight: "600",
            },
          }}
        />

        {/* Back to email link */}
        <View className="mt-6 items-center">
          <Pressable onPress={() => setStep("email")} className="py-2 px-4">
            <Text className="text-sm text-primary font-medium">
              ← Change email address
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
};

export default ConfirmEmail;
