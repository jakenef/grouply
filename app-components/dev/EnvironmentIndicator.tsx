import { getAppEnv } from "@/lib/environmentMode";
import { Text, View } from "react-native";

/**
 * Shows a small indicator of which environment the app is running in.
 * Green for local, orange for staging.
 * Hidden in production.
 */
export default function EnvironmentIndicator() {
  try {
    const env = getAppEnv();

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
  } catch (error) {
    // Silently fail if environment config is unavailable
    console.warn("[EnvironmentIndicator] Could not load environment:", error);
    return null;
  }
}
