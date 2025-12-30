import { requestMediaLibraryPermission } from "@/lib/permissions";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

interface UploadMultiplePicturesProps {
  /**
   * Array of image URIs - first one is the cover image
   */
  value: string[];

  /**
   * Called when images are added, removed, or reordered
   */
  onChange: (uris: string[]) => void;

  /**
   * Maximum number of images allowed
   * @default 5
   */
  maxImages?: number;

  /**
   * Whether the component is disabled
   * @default false
   */
  disabled?: boolean;
}

/**
 * A component for uploading multiple event images
 * First image is always the cover image
 */
export const UploadMultiplePictures: React.FC<UploadMultiplePicturesProps> = ({
  value,
  onChange,
  maxImages = 5,
  disabled = false,
}) => {
  const handleAddImage = async () => {
    if (disabled || value.length >= maxImages) return;

    if (await requestMediaLibraryPermission()) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onChange([...value, result.assets[0].uri]);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    if (disabled) return;
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const imageSize = 120;

  return (
    <View>
      <Text className="text-md font-semibold mb-2 text-foreground">
        Event Images {value.length > 0 && `(${value.length}/${maxImages})`}
      </Text>
      {value.length === 0 && (
        <Text className="text-xs text-muted mb-2">
          First image will be the cover image
        </Text>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {/* Display existing images */}
          {value.map((uri, index) => (
            <View key={index} className="relative">
              <View
                className="rounded-xl overflow-hidden border-2 border-solid"
                style={{
                  width: imageSize,
                  height: imageSize,
                  borderColor: index === 0 ? colors.primary : colors.border,
                }}
              >
                <Image
                  source={{ uri }}
                  style={{ width: imageSize, height: imageSize }}
                  resizeMode="cover"
                />
              </View>

              {/* Cover badge */}
              {index === 0 && (
                <View className="absolute top-1 left-1 bg-primary px-2 py-0.5 rounded">
                  <Text className="text-white text-xs font-medium">Cover</Text>
                </View>
              )}

              {/* Remove button */}
              <Pressable
                onPress={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
                disabled={disabled}
              >
                <Ionicons name="close" size={16} color="white" />
              </Pressable>
            </View>
          ))}

          {/* Add image button */}
          {value.length < maxImages && (
            <Pressable
              onPress={handleAddImage}
              className={`rounded-xl items-center justify-center border-2 border-dashed border-muted ${
                disabled ? "opacity-50" : ""
              }`}
              style={{
                width: imageSize,
                height: imageSize,
                backgroundColor: colors.background.darker,
              }}
              disabled={disabled}
            >
              <Ionicons name="add" size={32} color={colors.muted.DEFAULT} />
              <Text className="text-xs text-muted mt-1">
                {value.length === 0 ? "Add Cover" : "Add Image"}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default UploadMultiplePictures;
