import {
  getAppEnv,
  getIAPMode,
} from "@/lib/environmentMode";
import Constants from "expo-constants";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

/**
 * Debug component to display current environment variables
 * Add this to your Dev screen or anywhere you need to debug env vars
 */
export function EnvDebugger() {
  const [isExpanded, setIsExpanded] = useState(false);

  const appEnv = getAppEnv();
  const iapMode = getIAPMode();

  const envVars = {
    "TRPC URL": Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_TRPC_URL || "NOT SET",
    "Supabase URL":
      Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_SUPABASE_URL || "NOT SET",
    "Supabase Key": Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_SUPABASE_KEY
      ? `${Constants.expoConfig.extra.env.EXPO_PUBLIC_SUPABASE_KEY.substring(0, 20)}...`
      : "NOT SET",
  };

  const configInfo = {
    "App Version": Constants.expoConfig?.version || "unknown",
    "Runtime Version":
      typeof Constants.expoConfig?.runtimeVersion === "string"
        ? Constants.expoConfig.runtimeVersion
        : Constants.expoConfig?.runtimeVersion?.policy || "unknown",
    "App Environment": appEnv,
    "IAP Mode": iapMode,
    "Updates URL": Constants.expoConfig?.updates?.url || "NOT SET",
    "EAS Project ID": Constants.expoConfig?.extra?.eas?.projectId || "NOT SET",
    __DEV__: String(__DEV__),
  };

  return (
    <View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 my-2">
      <Pressable onPress={() => setIsExpanded(!isExpanded)}>
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          🔧 Environment Config {isExpanded ? "▼" : "▶"}
        </Text>
      </Pressable>

      {isExpanded && (
        <ScrollView className="max-h-96">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2 mb-1">
            Environment Variables:
          </Text>
          {Object.entries(envVars).map(([key, value]) => (
            <View
              key={key}
              className="mb-2 bg-white dark:bg-gray-700 p-2 rounded"
            >
              <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {key}
              </Text>
              <Text className="text-sm text-gray-900 dark:text-white font-mono">
                {value}
              </Text>
            </View>
          ))}

          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-1">
            App Config:
          </Text>
          {Object.entries(configInfo).map(([key, value]) => (
            <View
              key={key}
              className="mb-2 bg-white dark:bg-gray-700 p-2 rounded"
            >
              <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {key}
              </Text>
              <Text className="text-sm text-gray-900 dark:text-white font-mono">
                {value}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
