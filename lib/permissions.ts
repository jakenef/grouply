import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Alert } from "react-native";

export const requestMediaLibraryPermission = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permission needed",
      "We need access to your photos to set a profile picture."
    );
    return false;
  }
  return true;
};

// You can add more permission functions as needed
export const requestCameraPermission = async () => {
  // Implementation
};

export const requestForegroundLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permission needed",
      "We need access to your photos to set a profile picture."
    );
    return false;
  }
  return true;
};
