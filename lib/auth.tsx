import { Session } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "./supabase";

// Auth Context Type
interface AuthContextType {
  session: Session | null;
  user: Session["user"] | null;
  isLoading: boolean;
  sendOTP: (email: string) => Promise<{ data?: any; error?: any }>;
  verifyOTP: (
    email: string,
    token: string
  ) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
}

// Create Auth Context
export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  sendOTP: async () => ({}),
  verifyOTP: async () => ({}),
  signOut: async () => {},
});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Send OTP to email
  const sendOTP = async (email: string) => {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Creates user if they don't exist
      },
    });
  };

  // Verify OTP code
  const verifyOTP = async (email: string, token: string) => {
    return await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user: session?.user ?? null,
    isLoading,
    sendOTP,
    verifyOTP,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
