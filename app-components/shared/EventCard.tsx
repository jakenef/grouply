import { format } from "date-fns";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

interface EventCardProps {
  event: any; // Using any for now since the API structure differs from Event type
  onJoin?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onJoin }) => {
  // TODO: fix this nonsense for typesafety
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
    eventData.currentAttendees ||
    eventData.currentParticipants ||
    eventData.registrations?.length ||
    0;
  const maxParticipants =
    eventData.maxAttendees || eventData.maxParticipants || 0;

  return (
    <Pressable onPress={onJoin}>
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
            <View className="bg-primary px-6 py-2 rounded-full">
              <Text className="text-white font-medium">View</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};
