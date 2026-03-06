import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";
import { useCurrentUser } from "@/lib/useCurrentUserHook";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function AppLayout() {
  const { session, signOut } = useAuth();
  const { user: profile, isLoading } = useCurrentUser();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Start timeout timer when loading profile
  // Must be before conditional returns (Rules of Hooks)
  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      if (isLoading) {
        console.error("[AppLayout] Profile loading timed out after 6 seconds");
        setHasTimedOut(true);
      }
    }, 6000); // 6 second timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  // If no session, redirect to auth
  if (!session) {
    return <Redirect href="/(auth)/LandingPage" />;
  }

  // Show timeout error screen
  if (hasTimedOut) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={colors.danger.DEFAULT}
        />
        <Text className="text-2xl font-bold text-foreground mt-6 text-center">
          Unable to Load Profile
        </Text>
        <Text className="text-base text-muted mt-3 text-center">
          Connection timed out. Please check your network and try again.
        </Text>
        <View className="flex-row gap-4 mt-8 w-full">
          <Pressable
            onPress={() => {
              setHasTimedOut(false);
              // Force refetch by navigating back to index
              router.replace("/");
            }}
            className="flex-1 bg-primary rounded-lg py-4 items-center"
          >
            <Text className="text-white font-semibold text-base">Retry</Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              await signOut();
              router.replace("/(auth)/LandingPage");
            }}
            className="flex-1 border border-border rounded-lg py-4 items-center"
          >
            <Text className="text-foreground font-semibold text-base">
              Logout
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Keep showing nothing while loading (splash is still visible from index.tsx)
  if (isLoading) {
    return null;
  }

  const isAdmin = profile?.role === "ADMIN";

  return (
    <>
      {/* <EnvironmentIndicator /> */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted.DEFAULT,
          tabBarStyle: {
            backgroundColor: colors.background.DEFAULT,
            borderTopColor: colors.border,
            paddingBottom: 0,
            paddingTop: 4,
            height: 55,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            // Elevation for Android
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Browse"
          options={{
            href: null, // remove this when ready
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "search" : "search-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Events"
          options={{
            title: "My Events",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "calendar" : "calendar-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Messages"
          options={{
            href: null, // remove this when ready
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "chatbubble" : "chatbubble-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen name="Dev" options={{ href: null }} />
      </Tabs>
    </>
  );
}
