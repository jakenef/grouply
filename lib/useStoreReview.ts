import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const REVIEW_REQUESTED_KEY = "@grouply/review_requested";

export async function maybeRequestReview() {
  const already = await AsyncStorage.getItem(REVIEW_REQUESTED_KEY);
  if (already) return;

  const available = await StoreReview.hasAction();
  if (!available) return;

  await AsyncStorage.setItem(REVIEW_REQUESTED_KEY, "true");
  await new Promise((r) => setTimeout(r, 1500));
  await StoreReview.requestReview();
}