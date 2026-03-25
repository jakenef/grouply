import { getAppEnvironment } from "@/lib/environmentMode";
import { Text, View } from "react-native";

/**
 * Shows a small indicator of which environment the app is running in.
 * Only displays in development (LOCAL) and staging environments.
 * Hidden in production.
 */
export default function EnvironmentIndicator() {
  const environment = getAppEnvironment();

  if (environment !== "LOCAL") {
    return null;
  }

  return (
    <View
      style={{
        position: "absolute",
        bottom: 60, // Just above the tab bar (55px height + 5px margin)
        right: 8,
        backgroundColor: "#10b981",
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
        {environment}
      </Text>
    </View>
  );
}
