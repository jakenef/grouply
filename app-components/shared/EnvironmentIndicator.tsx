import { Text, View } from "react-native";

/**
 * Shows a small indicator of which environment the app is running in.
 * Only displays in development (LOCAL) and staging environments.
 * Hidden in production.
 */
export default function EnvironmentIndicator() {
  const trpcUrl = process.env.EXPO_PUBLIC_TRPC_URL || "";

  // Determine environment based on TRPC URL
  let environment: "LOCAL" | "STAGING" | "PRODUCTION" | null = null;
  let bgColor = "";
  let textColor = "";

  if (trpcUrl.includes("localhost") || trpcUrl.includes("127.0.0.1")) {
    environment = "LOCAL";
    bgColor = "#10b981"; // green
    textColor = "#ffffff";
  } else if (trpcUrl.includes("render.com")) {
    environment = "STAGING";
    bgColor = "#f59e0b"; // amber
    textColor = "#ffffff";
  }
  // For production or if we can't determine, don't show anything
  else {
    return null;
  }

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
          color: textColor,
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.5,
        }}
      >
        {environment}
      </Text>
    </View>
  );
}
