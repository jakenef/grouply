export type AppEnv = "local" | "staging" | "prod";

const getAppEnv = (): AppEnv => {
  const appEnv = process.env.APP_ENV;

  if (!appEnv || !["local", "staging", "prod"].includes(appEnv)) {
    throw new Error(
      `Invalid or missing APP_ENV: "${appEnv}". Expected "local", "staging", or "prod". ` +
        `Make sure APP_ENV is set in your .env file.`
    );
  }

  return appEnv as AppEnv;
};

const isLocalMode = (): boolean => {
  return getAppEnv() === "local";
};

const getAppleAppStoreEnv = (): "SANDBOX" | "PRODUCTION" => {
  const env = getAppEnv();
  return env === "prod" ? "PRODUCTION" : "SANDBOX";
};

// Export environment variables needed by the server
export const env = {
  // Environment
  APP_ENV: getAppEnv(),
  IS_LOCAL_MODE: isLocalMode(),

  // API Keys
  GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,

  // Supabase
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,

  //Google play parsed
  GOOGLE_PLAY_SERVICE_ACCOUNT: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
    ? (() => {
        const parsed = JSON.parse(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON);

        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");

        return parsed;
      })()
    : null,

  // Apple IAP config (auto-derived from APP_ENV)
  APPLE_APP_STORE_ENV: getAppleAppStoreEnv(),
  APPLE_ROOT_CA_PATHS: process.env.APPLE_ROOT_CA_PATHS
    ? process.env.APPLE_ROOT_CA_PATHS.split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined,
  APPLE_ROOT_CA_PATH: process.env.APPLE_ROOT_CA_PATH,
  APPLE_APP_ID: process.env.APPLE_APP_ID
    ? parseInt(process.env.APPLE_APP_ID, 10)
    : undefined,

  // Server config
  PORT: process.env.PORT || 3001,
};

// Export helper functions
export { getAppEnv, isLocalMode };

// Type check environment variables
if (!env.GOOGLE_PLACES_API_KEY) {
  console.warn("GOOGLE_PLACES_API_KEY is not defined in environment variables");
}

if (!env.GOOGLE_PLAY_SERVICE_ACCOUNT) {
  console.warn(
    "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is not defined in environment variables",
  );
}

console.log(`[ENV] Running in ${env.APP_ENV} mode`);
console.log(
  `[IAP] Backend verification mode: ${env.IS_LOCAL_MODE ? "LOCAL_MOCK" : "REAL_VERIFY"}`,
);
console.log(`[IAP] Apple App Store environment: ${env.APPLE_APP_STORE_ENV}`);

if (env.APPLE_APP_STORE_ENV === "PRODUCTION" && !env.APPLE_APP_ID) {
  console.warn("APPLE_APP_ID is required in PRODUCTION environment");
}

if (
  !env.APPLE_ROOT_CA_PATHS?.length &&
  !env.APPLE_ROOT_CA_PATH &&
  !env.IS_LOCAL_MODE
) {
  console.warn(
    "APPLE_ROOT_CA_PATHS or APPLE_ROOT_CA_PATH is required for non-local iOS verification",
  );
}
