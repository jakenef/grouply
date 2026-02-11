import { getAuthErrorMessage, parseAuthError } from "@/lib/auth";
import { colors } from "@/lib/theme";
import React, { useState } from "react";
import { Alert, View } from "react-native";
import FormField from "../shared/FormField";
import GrouplyButton from "../shared/GrouplyButton";

interface EmailAndPasswordProps {
  buttonLabel: string;
  onButtonPress: (
    email: string,
    password: string,
  ) => Promise<{ data?: any; error?: any }>;
  onSuccess: () => void;
}

const EmailAndPassword = ({
  buttonLabel,
  onButtonPress,
  onSuccess,
}: EmailAndPasswordProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonPress = async () => {
    setIsLoading(true);
    try {
      const result = await onButtonPress(email, password);
      if (result.error) {
        const errorType = parseAuthError(result.error);
        const errorMessage = getAuthErrorMessage(errorType);
        Alert.alert("Error", "Username or password is incorrect");
      } else {
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Email input field */}
      <View className="w-full mt-12 mb-4">
        <FormField
          label="Email"
          labelClassName="text-m text-muted-darker mb-2 ml-1"
          containerClassName=""
          placeholder="you@email.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={{
            height: 56,
            borderRadius: 8,
            width: "100%",
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: "white",
            color: colors.foreground,
          }}
        />
      </View>
      <FormField
        label="Password"
        labelClassName="text-m text-muted-darker mb-2 ml-1"
        containerClassName=""
        placeholder="password1"
        placeholderTextColor="#9CA3AF"
        keyboardType="default"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          height: 56,
          borderRadius: 8,
          width: "100%",
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: "white",
          color: colors.foreground,
        }}
        returnKeyType="done"
        onSubmitEditing={handleButtonPress}
      />

      {/* Button */}
      <View className="w-full mt-6">
        <GrouplyButton
          label={isLoading ? "Loading..." : buttonLabel}
          variant="primary"
          size="large"
          fullWidth
          onPress={handleButtonPress}
          disabled={isLoading || !email.trim() || !password.trim()}
          isLoading={isLoading}
        />
      </View>
    </>
  );
};

export default EmailAndPassword;
