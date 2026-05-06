import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Grouply",
  slug: "grouply",
  version: "1.0.5",
  orientation: "portrait",
  icon: "./assets/images/grouplyAppIcon.png",
  scheme: "grouply",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    url: "https://u.expo.dev/94502a26-4752-4105-b2b0-602ba67498ff",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.grouply.grouplyapp",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        "Grouply uses your location to show nearby events and groups.",
      NSPhotoLibraryUsageDescription:
        "Grouply allows you to upload photos for your profile and events.",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/grouplyAppIcon.png",
      backgroundImage: "./assets/images/grouplyAppIcon.png",
      monochromeImage: "./assets/images/grouplyAppIcon.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.grouply.grouply",
    softwareKeyboardLayoutMode: "resize",
  },
  web: {
    output: "static",
    favicon: "./assets/images/grouplyAppIcon.png",
  },
  plugins: [
    "expo-router",
    "react-native-iap",
    [
      "react-native-fbsdk-next",
      {
        appID: process.env.FACEBOOK_APP_ID || "",
        clientToken: process.env.FACEBOOK_CLIENT_TOKEN || "",
        displayName: "Grouply",
        scheme: `fb${process.env.FACEBOOK_APP_ID || ""}`,
        autoLogAppEventsEnabled: true,
        advertiserIDCollectionEnabled: true,
        isAutoInitEnabled: true,
        iosUserTrackingPermission:
          "This identifier will be used to deliver personalized ads to you.",
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/grouplyAppIcon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#4f47e5",
        dark: {
          backgroundColor: "#4f47e5",
        },
      },
    ],
    "expo-web-browser",
    "expo-localization",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "94502a26-4752-4105-b2b0-602ba67498ff",
    },
    // Bake environment variables into the app config
    // These will be available via Constants.expoConfig.extra
    env: {
      APP_ENV: process.env.APP_ENV || "",
      EXPO_PUBLIC_TRPC_URL: process.env.EXPO_PUBLIC_TRPC_URL || "",
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
      EXPO_PUBLIC_SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY || "",
    },
  },
});
