import Constants from "expo-constants";

export type AppEnv = "local" | "staging" | "prod";

const getAppEnvFromConstants = (): string | undefined => {
  return Constants.expoConfig?.extra?.env?.APP_ENV;
};

export const getAppEnv = (): AppEnv => {
  const appEnv = getAppEnvFromConstants();

  if (!appEnv || !["local", "staging", "prod"].includes(appEnv)) {
    throw new Error(
      `Invalid or missing APP_ENV: "${appEnv}". Expected "local", "staging", or "prod". ` +
        `Make sure APP_ENV is set in your .env file and baked into app.config.ts.`
    );
  }

  return appEnv as AppEnv;
};

export const isLocalDevelopmentMode = (): boolean => {
  return getAppEnv() === "local";
};

export const getIAPMode = (): "MOCK" | "REAL" => {
  return isLocalDevelopmentMode() ? "MOCK" : "REAL";
};
