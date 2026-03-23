const isLocalHostValue = (value?: string) => {
  if (!value) {
    return false;
  }

  return /localhost|127\.0\.0\.1|10\.0\.2\.2/i.test(value);
};

const isLocalDatabaseValue = (value?: string) => {
  if (!value) {
    return false;
  }

  // 54322 is the default local Supabase Postgres port.
  return isLocalHostValue(value) || value.includes(":54322");
};

const isLocalRuntime = () => {
  const trpcUrl = process.env.EXPO_PUBLIC_TRPC_URL;
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  const hasLocalTrpcUrl = isLocalHostValue(trpcUrl);
  const hasLocalDatabase =
    isLocalDatabaseValue(databaseUrl) || isLocalDatabaseValue(directUrl);

  if (hasLocalDatabase) {
    return true;
  }

  // Fallback only when DB URLs are unavailable.
  if (!databaseUrl && !directUrl) {
    return hasLocalTrpcUrl;
  }

  return false;
};

// Export environment variables needed by the server
export const env = {
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

  IS_LOCAL_MODE: isLocalRuntime(),

  // Server config
  PORT: process.env.PORT || 3001,
};

// Type check environment variables
if (!env.GOOGLE_PLACES_API_KEY) {
  console.warn("GOOGLE_PLACES_API_KEY is not defined in environment variables");
}

if (!env.GOOGLE_PLAY_SERVICE_ACCOUNT) {
  console.warn(
    "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is not defined in environment variables",
  );
}

console.log(
  `[IAP] Backend verification mode: ${env.IS_LOCAL_MODE ? "LOCAL_MOCK" : "REAL_VERIFY"}`,
);
