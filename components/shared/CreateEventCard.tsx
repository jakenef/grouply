import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CreateEventCardProps {
  onClick: () => void;
  buttonText: string;
}

export default function CreateEventCard(props: CreateEventCardProps) {
  return (
    <View className="flex-row bg-accent rounded-xl p-4 mb-4">
      {/* Content */}
      <View className="flex-1">
        {/* Title */}
        <Text className="text-lg text-center font-semibold mb-1">
          Can't find what you're looking for?
        </Text>

        {/* Subtitle */}
        <Text className="text-gray-600 mb-2 text-center">
          Create your own event and connect with like-minded people
        </Text>

        {/* Bottom Row */}
        <View className="flex-row items-center justify-center">
          {/* Join Button */}
          <TouchableOpacity
            onPress={props.onClick}
            className="bg-primary px-6 py-2 rounded-full"
          >
            <Text className="text-white font-medium">{props.buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
