import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";

/**
 * Handles deep links for auth redirects (e.g., magic links)
 * Extracts auth tokens from URL and sets session in Supabase
 */
export function DeepLinkHandler() {
  const router = useRouter();

  const handleAuthRedirect = useCallback(
    async (url: string) => {
      try {
        // Parse URL - auth tokens are in the fragment (after #)
        const urlObj = new URL(url);
        const fragment = urlObj.hash.substring(1); // Remove the #

        if (!fragment) {
          console.log("[DeepLink] No fragment in URL, skipping auth handling");
          return;
        }

        // Parse fragment as query string
        const params = new URLSearchParams(fragment);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");

        console.log("[DeepLink] Parsed params:", {
          type,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        });

        // If we have auth tokens, set the session
        if (accessToken && refreshToken) {
          console.log("[DeepLink] Logging out current user first...");

          // Sign out current user first to avoid conflicts
          await supabase.auth.signOut();

          console.log("[DeepLink] Setting session with new tokens...");

          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("[DeepLink] Error setting session:", error);
          } else {
            console.log("[DeepLink] ✅ Session set successfully!", {
              userId: data.user?.id,
              email: data.user?.email,
            });

            // Verify session is accessible immediately
            const { data: verifySession } = await supabase.auth.getSession();
            console.log("[DeepLink] Verified session:", {
              hasSession: !!verifySession.session,
              userId: verifySession.session?.user?.id,
              hasAccessToken: !!verifySession.session?.access_token,
            });

            // Navigate to home screen after session is set
            // Add a delay to ensure auth state propagates to providers
            setTimeout(() => {
              console.log("[DeepLink] Navigating to Home...");
              router.replace("/(app)/Home");
            }, 1500);
          }
        } else {
          console.log("[DeepLink] No auth tokens found in URL");
        }
      } catch (error) {
        console.error("[DeepLink] Error handling auth redirect:", error);
      }
    },
    [router],
  );

  useEffect(() => {
    // Handle initial URL when app is opened via deep link
    const handleInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        console.log("[DeepLink] Initial URL:", url);
        handleAuthRedirect(url);
      }
    };

    // Handle deep links when app is already open
    const subscription = Linking.addEventListener("url", ({ url }) => {
      console.log("[DeepLink] Received URL:", url);
      handleAuthRedirect(url);
    });

    handleInitialUrl();

    return () => {
      subscription.remove();
    };
  }, [handleAuthRedirect]);

  return null; // This component doesn't render anything
}
