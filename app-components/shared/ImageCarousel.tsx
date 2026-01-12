import { useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface ImageCarouselProps {
  additionalImageUrls?: string[];
  coverImageUrl: string;
  aspectRatio?: "square" | "wide";
}

export default function ImageCarousel({
  additionalImageUrls,
  coverImageUrl,
  aspectRatio = "wide",
}: ImageCarouselProps) {
  // Ensure coverImageUrl is first in the array
  const orderedImages = coverImageUrl
    ? [coverImageUrl, ...(additionalImageUrls || [])]
    : additionalImageUrls || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  if (!orderedImages || orderedImages.length === 0) {
    return (
      <View className="w-full h-64 bg-gray-200 rounded-xl items-center justify-center">
        <Text className="text-gray-500">No images available</Text>
      </View>
    );
  }

  const imageHeight = aspectRatio === "square" ? SCREEN_WIDTH : 256;

  return (
    <View style={{ marginLeft: -16, marginRight: -16, overflow: "hidden" }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ width: SCREEN_WIDTH }}
      >
        {orderedImages.map((url, index) => (
          <View
            key={index}
            style={{ width: SCREEN_WIDTH, paddingHorizontal: 16 }}
          >
            <View className="rounded-xl overflow-hidden">
              <Image
                source={{ uri: url }}
                style={{ width: SCREEN_WIDTH - 32, height: imageHeight }}
                resizeMode="cover"
              />
              <View className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded">
                <Text className="text-white text-sm font-medium">
                  {index + 1}/{orderedImages.length}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
