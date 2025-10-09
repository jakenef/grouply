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

  // Server config
  PORT: process.env.PORT || 3001,
};

// Type check environment variables
if (!env.GOOGLE_PLACES_API_KEY) {
  console.warn("GOOGLE_PLACES_API_KEY is not defined in environment variables");
}
