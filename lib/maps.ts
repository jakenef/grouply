import * as Linking from "expo-linking";
import { Alert, Platform } from "react-native";

interface OpenInMapsParams {
  lat: number;
  lng: number;
  label?: string;
}

/**
 * Opens the given coordinates in the device's native maps application.
 * - iOS: Opens in Apple Maps
 * - Android: Opens in Google Maps
 *
 * @param lat - Latitude coordinate
 * @param lng - Longitude coordinate
 * @param label - Optional label for the location pin
 */
export const openInMaps = ({ lat, lng, label }: OpenInMapsParams) => {
  const encodedLabel = label ? encodeURIComponent(label) : "";

  const url =
    Platform.OS === "ios"
      ? `maps://maps.apple.com/?ll=${lat},${lng}&q=${encodedLabel}`
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  Linking.openURL(url).catch((err) => {
    console.error("Error opening maps:", err);
    Alert.alert("Error", "Unable to open maps application");
  });
};
