import { getAppEnv } from "@/lib/environmentMode";
import PostHog from "posthog-react-native";

// Initialize PostHog client with error handling
let posthog: any = null;
let posthogInitError: Error | null = null;

try {
  posthog = new PostHog("phc_wbUe4mPgWWLHdQwTw6BT3QTsPW7RVZN5KWJv7neY9G56", {
    host: "https://us.i.posthog.com",
  });

  // Register global properties using consistent environment detection
  let appEnv: string;
  try {
    appEnv = getAppEnv();
  } catch {
    appEnv = "unknown";
    console.warn(
      "[PostHog] Could not determine APP_ENV, defaulting to 'unknown'",
    );
  }

  // Map your environment values to development/production
  const environment = appEnv === "prod" ? "production" : "development";

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
