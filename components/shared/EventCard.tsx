import { format } from "date-fns";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface EventCardProps {
  event: any; // Using any for now since the API structure differs from Event type
  onJoin?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onJoin }) => {
  // Handle both the API structure (event.event) and direct event structure
  const eventData = event.event || event;
  const dateTime = eventData.startsAt || eventData.dateTime;
  const title = eventData.name || eventData.title;
  const location = eventData.location?.formatted || eventData.location;
  const imageUrl =
    eventData.coverImageUrl ||
    eventData.imageUrls?.[0] ||
    eventData.thumbnailUrl;
  const currentParticipants =
    eventData.currentAttendees || eventData.currentParticipants || 0;
  const maxParticipants =
    eventData.maxAttendees || eventData.maxParticipants || 0;

  return (
    <View className="flex-row bg-white rounded-xl overflow-hidden shadow-sm mb-4 border-border border-solid border-2 h-36">
      {/* Thumbnail */}
      <Image
        source={{ uri: imageUrl }}
        style={{ width: 96, height: "100%" }}
        resizeMode="cover"
      />

      {/* Content */}
      <View className="flex-1 p-4 pt-2">
        {/* Title */}
        <Text className="text-lg font-semibold mb-1" numberOfLines={1}>
          {title}
        </Text>

        {/* Location */}
        <Text className="text-gray-600 mb-1" numberOfLines={1}>
          {location}
        </Text>

        {/* Date & Time */}
        <Text className="text-gray-600 mb-2">
          {dateTime
            ? format(new Date(dateTime), "MMM d, yyyy • h:mm a")
            : "Date TBD"}
        </Text>

        {/* Bottom Row */}
        <View className="flex-row items-center justify-between">
          {/* Participants */}
          <Text className="text-gray-700">
            {currentParticipants}/{maxParticipants} people
          </Text>

          {/* Join Button */}
          <TouchableOpacity
            onPress={onJoin}
            className="bg-primary px-6 py-2 rounded-full"
          >
            <Text className="text-white font-medium">Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
