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
  imageUrls: string[];
  aspectRatio?: "square" | "wide";
}

export default function ImageCarousel({
  imageUrls,
  aspectRatio = "wide",
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <View className="w-full h-64 bg-gray-200 rounded-xl items-center justify-center">
        <Text className="text-gray-500">No images available</Text>
      </View>
    );
  }

  const imageHeight = aspectRatio === "square" ? SCREEN_WIDTH - 32 : 256;

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      {imageUrls.map((url, index) => (
        <View key={index} style={{ width: SCREEN_WIDTH }}>
          <View className="mx-4 rounded-xl overflow-hidden">
            <Image
              source={{ uri: url }}
              style={{ width: SCREEN_WIDTH - 32, height: imageHeight }}
              resizeMode="cover"
            />
            <View className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded">
              <Text className="text-white text-sm font-medium">
                {currentIndex + 1}/{imageUrls.length}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
