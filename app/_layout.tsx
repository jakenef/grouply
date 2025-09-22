import { Stack } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./globals.css";

// Create AuthContext with default values
export const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: (value: boolean) => {},
  isLoading: true,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, check AsyncStorage for auth token
    // For now, just simulate a loading delay
    setTimeout(() => {
      // Default to not authenticated to show onboarding
      setIsAuthenticated(false);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        isLoading,
      }}
    >
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        ></Stack>
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}
