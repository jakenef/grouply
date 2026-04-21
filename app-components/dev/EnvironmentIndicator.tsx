import { getAppEnv } from "@/lib/environmentMode";
import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";

/**
 * Shows a small indicator of which environment the app is running in.
 * Green for local, orange for staging.
 * Hidden in production.
 */
export default function EnvironmentIndicator() {
  const [hasError, setHasError] = useState(false);
  const [env, setEnv] = useState<string | null>(null);

  useEffect(() => {
    try {
      const appEnv = getAppEnv();
      setEnv(appEnv);
    } catch (error: any) {
      console.error("[EnvironmentIndicator] Error retrieving APP_ENV:", error);
      setHasError(true);
      // Show alert to user so they know what's wrong
      Alert.alert(
        "Environment Configuration Error",
        `Failed to load environment configuration.\n\nReason: ${error?.message || "Unknown error"}\n\nPlease ensure APP_ENV is properly set in your .env file.`,
        [{ text: "OK" }],
      );
    }
  }, []);

  // If there's an error or env is not set, don't render anything
  if (hasError || !env) {
    return null;
  }

  // Only show in local and staging, not production
  if (env === "prod") {
    return null;
  }

  const bgColor = env === "local" ? "#10b981" : "#f59e0b";
  const label = env.toUpperCase();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 60, // Just above the tab bar (55px height + 5px margin)
        right: 8,
        backgroundColor: bgColor,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        opacity: 0.9,
        zIndex: 1000,
      }}
    >
      <Text
        style={{
          color: "#ffffff",
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
