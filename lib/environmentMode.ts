import Constants from "expo-constants";

export type AppEnvironment = "LOCAL" | "REMOTE";

export const getConfiguredTrpcUrl = (): string => {
  return (
    Constants.expoConfig?.extra?.env?.EXPO_PUBLIC_TRPC_URL ||
    process.env.EXPO_PUBLIC_TRPC_URL ||
    ""
  );
};

export const isLocalTrpcUrl = (url: string): boolean => {
  return /localhost|127\.0\.0\.1|10\.0\.2\.2/i.test(url);
};

export const getAppEnvironment = (): AppEnvironment => {
  return isLocalTrpcUrl(getConfiguredTrpcUrl()) ? "LOCAL" : "REMOTE";
};

export const isLocalDevelopmentMode = (): boolean => {
  return getAppEnvironment() === "LOCAL";
};

export const getIAPMode = (): "MOCK" | "REAL" => {
  return isLocalDevelopmentMode() ? "MOCK" : "REAL";
};
