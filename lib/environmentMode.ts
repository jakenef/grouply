import Constants from "expo-constants";

export type AppEnv = "local" | "staging" | "prod";

const getAppEnvFromConstants = (): string | undefined => {
  return Constants.expoConfig?.extra?.env?.APP_ENV;
};

export const getAppEnv = (): AppEnv => {
  try {
    const appEnv = getAppEnvFromConstants();

    if (!appEnv || !["local", "staging", "prod"].includes(appEnv)) {
      throw new Error(
        `Invalid or missing APP_ENV: "${appEnv}". Expected "local", "staging", or "prod". ` +
          `Make sure APP_ENV is set in your .env file and baked into app.config.ts.`
      );
    }

    return appEnv as AppEnv;
  } catch (error) {
    console.error("[getAppEnv] Error:", error);
    throw error;
  }
};

export const isLocalDevelopmentMode = (): boolean => {
  try {
    return getAppEnv() === "local";
  } catch {
    // If getAppEnv throws, assume non-local (safer default)
    return false;
  }
};

export const getIAPMode = (): "MOCK" | "REAL" => {
  try {
    return isLocalDevelopmentMode() ? "MOCK" : "REAL";
  } catch {
    // If we can't determine env, use REAL (safer default for production)
    return "REAL";
  }
};
