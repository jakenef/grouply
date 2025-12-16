import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CreateEventCardProps {
  onClick: () => void;
  buttonText: string;
  subtitleText?: string;
  fullWidth?: boolean;
}

export default function CreateEventCard(props: CreateEventCardProps) {
  return (
    <View
      className="bg-accent rounded-xl p-4 mb-4 h-36 justify-center"
      style={props.fullWidth ? { width: "100%" } : { width: 296 }}
    >
      {/* Content */}
      <View>
        {/* Title */}
        <Text className="text-lg text-center font-semibold mb-1">
          Can't find what you're looking for?
        </Text>

        {/* Subtitle */}
        {props.subtitleText && (
          <Text className="text-gray-600 mb-2 text-center">
            {props.subtitleText}
          </Text>
        )}

        {/* Bottom Row */}
        <View className="flex-row items-center justify-center">
          {/* Join Button */}
          <TouchableOpacity
            onPress={props.onClick}
            className="bg-primary px-6 py-2 rounded-full"
          >
            <Text className="text-white font-medium text-center">
              {props.buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
