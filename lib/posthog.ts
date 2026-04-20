import Constants from "expo-constants";
import PostHog from "posthog-react-native";

// Initialize PostHog client
export const posthog = new PostHog("phc_wbUe4mPgWWLHdQwTw6BT3QTsPW7RVZN5KWJv7neY9G56", {
  host: "https://us.i.posthog.com",
});

// Register global properties
const appEnv = Constants.expoConfig?.extra?.env?.APP_ENV || "unknown";

// Map your environment values to development/production
const environment = appEnv === "production" ? "production" : "development";

posthog.register({
  environment,
});