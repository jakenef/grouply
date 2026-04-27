import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

// Get Supabase config from baked-in app config (works with EAS updates)
let supabaseUrl =
  Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "";

// In development mode, convert localhost/127.0.0.1 to Android emulator IP
if (__DEV__ && Platform.OS === "android") {
  if (supabaseUrl.includes("localhost") || supabaseUrl.includes("127.0.0.1")) {
    supabaseUrl = supabaseUrl
      .replace("localhost", "10.0.2.2")
      .replace("127.0.0.1", "10.0.2.2");
    console.log(
      "[SUPABASE] Android emulator detected, using 10.0.2.2:",
      supabaseUrl,
    );
  }
}

const supabaseKey =
  Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_SUPABASE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  "";

export { supabaseUrl };

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});
