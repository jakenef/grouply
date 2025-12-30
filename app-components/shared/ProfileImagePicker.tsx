import { requestMediaLibraryPermission } from "@/lib/permissions";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

interface ProfileImagePickerProps {
  /**
   * Current image URI
   */
  value: string | null;

  /**
   * Called when image is selected or changed
   */
  onChange: (uri: string | null) => void;

  /**
   * Size of the image picker (width and height)
   * @default 128
   */
  size?: number;

  /**
   * Custom placeholder text
   * @default "Add Photo"
   */
  placeholder?: string;

  /**
   * Whether the component is disabled
   * @default false
   */
  disabled?: boolean;

  displayOnly?: boolean;
}

/**
 * A component for selecting a profile image from the device's media library
 */
export const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({
  value,
  onChange,
  size = 128,
  placeholder = "Add Photo",
  disabled = false,
  displayOnly = false,
}) => {
  const handlePress = async () => {
    if (disabled || displayOnly) return;

    if (await requestMediaLibraryPermission()) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onChange(result.assets[0].uri);
      }
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className={`rounded-full items-center justify-center border-2 border-solid border-muted-darker ${
        disabled ? "opacity-50" : ""
      }`}
      style={{
        width: size,
        height: size,
        backgroundColor: colors.background.darker,
      }}
      disabled={disabled}
    >
      {value ? (
        <Image
          source={{ uri: value }}
          className="w-full h-full rounded-full"
          resizeMode="cover"
          accessibilityLabel="Profile image"
        />
      ) : (
        <View className="items-center">
          <Ionicons
            name="camera"
            size={size / 4}
            color={colors.muted.DEFAULT}
          />
          <Text className="text-xs text-muted-darker mt-1">{placeholder}</Text>
        </View>
      )}
    </Pressable>
  );
};

export default ProfileImagePicker;
