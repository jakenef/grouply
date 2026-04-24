import { getAppEnv } from "@/lib/environmentMode";
import React, { ReactNode } from "react";

type PostHogClient = {
  identify: (...args: any[]) => void;
  capture: (...args: any[]) => void;
  register: (...args: any[]) => void;
};

type PostHogProviderProps = {
  client: PostHogClient;
  children: ReactNode;
};

type PostHogModuleShape = {
  default?: new (...args: any[]) => PostHogClient;
  PostHog?: new (...args: any[]) => PostHogClient;
  PostHogProvider?: React.ComponentType<PostHogProviderProps>;
};

const noopPosthogClient: PostHogClient = {
  identify: () => {},
  capture: () => {},
  register: () => {},
};

// Initialize PostHog client with error handling
let posthog: PostHogClient = noopPosthogClient;
let posthogInitError: Error | null = null;
let postHogProviderComponent: React.ComponentType<PostHogProviderProps> | null =
  null;

try {
  const posthogModule = require("posthog-react-native") as PostHogModuleShape;
  const PostHogCtor = posthogModule.default ?? posthogModule.PostHog;
  postHogProviderComponent = posthogModule.PostHogProvider ?? null;

  if (!PostHogCtor) {
    throw new Error("PostHog constructor is unavailable");
  }

  // Compute environment before constructing the client so it's included in
  // the Application Installed event (which fires during construction).
  let appEnv: string;
  try {
    appEnv = getAppEnv();
  } catch {
    appEnv = "unknown";
    console.warn(
      "[PostHog] Could not determine APP_ENV, defaulting to 'unknown'",
    );
  }

  const envMap: Record<string, string> = {
    prod: "production",
    staging: "staging",
    local: "development",
  };
  const environment = envMap[appEnv] ?? "unknown";

  posthog = new PostHogCtor("phc_wbUe4mPgWWLHdQwTw6BT3QTsPW7RVZN5KWJv7neY9G56", {
    host: "https://us.i.posthog.com",
    customAppProperties: (defaults: Record<string, unknown>) => ({
      ...defaults,
      environment,
    }),
  });

  posthog.register({ environment });
} catch (error) {
  console.warn("PostHog initialization failed:", error);
  posthogInitError = error as Error;
  posthog = noopPosthogClient;
  postHogProviderComponent = null;
}

export const SafePostHogProvider = ({ children }: { children: ReactNode }) => {
  if (!postHogProviderComponent) {
    return React.createElement(React.Fragment, null, children);
  }

  try {
    const Provider = postHogProviderComponent;
    return React.createElement(
      Provider as React.ComponentType<any>,
      { client: posthog },
      children,
    );
  } catch (providerError) {
    console.warn("PostHog provider render failed:", providerError);
    return React.createElement(React.Fragment, null, children);
  }
};

// Export both posthog and a flag to check if it initialized
export { posthog, posthogInitError };
