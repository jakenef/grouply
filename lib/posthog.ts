import Constants from "expo-constants";
import PostHog from "posthog-react-native";

// Initialize PostHog client with error handling
let posthog: any = null;
let posthogInitError: Error | null = null;

try {
  posthog = new PostHog("phc_wbUe4mPgWWLHdQwTw6BT3QTsPW7RVZN5KWJv7neY9G56", {
    host: "https://us.i.posthog.com",
  });

  // Register global properties
  const appEnv = Constants.expoConfig?.extra?.env?.APP_ENV || "unknown";

  // Map your environment values to development/production
  const environment = appEnv === "production" ? "production" : "development";

  posthog.register({
    environment,
  });
} catch (error) {
  console.warn("PostHog initialization failed:", error);
  posthogInitError = error as Error;
  // Create a no-op posthog that won't crash
  posthog = {
    identify: () => {},
    capture: () => {},
    register: () => {},
  };
}

// Export both posthog and a flag to check if it initialized
export { posthog, posthogInitError };