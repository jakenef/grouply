import { Session } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "./supabase";

// Auth Error Types
export enum AuthErrorType {
  RATE_LIMITED = "rate_limited",
  USER_NOT_FOUND = "user_not_found",
  INVALID_EMAIL = "invalid_email",
  INVALID_OTP = "invalid_otp",
  EXPIRED_OTP = "expired_otp",
  NETWORK_ERROR = "network_error",
  UNKNOWN = "unknown",
}

// Parse Supabase auth errors into our error types
export const parseAuthError = (error: any): AuthErrorType => {
  if (!error) return AuthErrorType.UNKNOWN;

  // Check HTTP status codes first (most reliable)
  switch (error.status) {
    case 429: // Too Many Requests
      return AuthErrorType.RATE_LIMITED;
    case 400: // Bad Request - often invalid email or OTP
      if (
        error.message?.toLowerCase().includes("invalid") &&
        error.message?.toLowerCase().includes("otp")
      ) {
        return AuthErrorType.INVALID_OTP;
      }
      if (error.message?.toLowerCase().includes("expired")) {
        return AuthErrorType.EXPIRED_OTP;
      }
      return AuthErrorType.INVALID_EMAIL;
    case 404: // Not Found
      return AuthErrorType.USER_NOT_FOUND;
    case 422: // Unprocessable Entity
      return AuthErrorType.INVALID_EMAIL;
    case 500: // Server Error
    case 502: // Bad Gateway
    case 503: // Service Unavailable
      return AuthErrorType.NETWORK_ERROR;
  }

  // Fallback to message parsing if no status code
  const message = error.message?.toLowerCase() || "";

  if (message.includes("rate") || message.includes("too many")) {
    return AuthErrorType.RATE_LIMITED;
  }
  if (message.includes("not found") || message.includes("does not exist")) {
    return AuthErrorType.USER_NOT_FOUND;
  }
  if (message.includes("invalid") && message.includes("email")) {
    return AuthErrorType.INVALID_EMAIL;
  }
  if (message.includes("invalid") && message.includes("otp")) {
    return AuthErrorType.INVALID_OTP;
  }
  if (message.includes("expired")) {
    return AuthErrorType.EXPIRED_OTP;
  }

  return AuthErrorType.UNKNOWN;
};

// Get user-friendly error messages
export const getAuthErrorMessage = (errorType: AuthErrorType): string => {
  switch (errorType) {
    case AuthErrorType.RATE_LIMITED:
      return "We've already sent you a code recently. Please check your email or wait a moment before requesting a new one.";
    case AuthErrorType.USER_NOT_FOUND:
      return "Sorry, that email doesn't match our records. Please check your email or create a new account.";
    case AuthErrorType.INVALID_EMAIL:
      return "Please enter a valid email address.";
    case AuthErrorType.INVALID_OTP:
      return "The code you entered is incorrect. Please try again.";
    case AuthErrorType.EXPIRED_OTP:
      return "This code has expired. Please request a new one.";
    case AuthErrorType.NETWORK_ERROR:
      return "Network error. Please check your connection and try again.";
    case AuthErrorType.UNKNOWN:
    default:
      return "Something went wrong. Please try again.";
  }
};

// Auth Context Type
interface AuthContextType {
  session: Session | null;
  user: Session["user"] | null;
  isLoading: boolean;
  sendLoginOTP: (email: string) => Promise<{ data?: any; error?: any }>;
  sendSignUpOTP: (email: string) => Promise<{ data?: any; error?: any }>;
  verifyOTP: (
    email: string,
    token: string
  ) => Promise<{ data?: any; error?: any }>;
  signInWithPassword: (
    email: string,
    password: string
  ) => Promise<{ data?: any; error?: any }>;
  signUpWithPassword: (
    email: string,
    password: string
  ) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
}

// Create Auth Context
export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  sendLoginOTP: async () => ({}),
  sendSignUpOTP: async () => ({}),
  verifyOTP: async () => ({}),
  signInWithPassword: async () => ({}),
  signUpWithPassword: async () => ({}),
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
  const sendLoginOTP = async (email: string) => {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });
  };

  const sendSignUpOTP = async (email: string) => {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
  };

  // Verify OTP code
  const verifyOTP = async (email: string, token: string) => {
    const result = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    return result;
  };

  // sign in with password
  const signInWithPassword = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  // Sign up with email and password
  const signUpWithPassword = async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
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
    sendLoginOTP,
    sendSignUpOTP,
    verifyOTP,
    signInWithPassword,
    signUpWithPassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
