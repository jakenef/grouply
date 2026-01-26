import { EventCardEvent } from "@/shared/types/Event";
import { format } from "date-fns";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

interface EventCardProps {
  event: EventCardEvent;
  onJoin?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onJoin }) => {
  const startsAt = event.startsAt;
  const name = event.name;
  const location = event.formattedLocation;
  const imageUrl = event.coverImageUrl;
  const currentParticipants = event.numCurrentParticipants || 0;
  const maxParticipants = event.maxAttendees || 0;

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
            {name}
          </Text>

          {/* Location */}
          <Text className="text-gray-600 mb-1" numberOfLines={1}>
            {location}
          </Text>

          {/* Date & Time */}
          <Text className="text-gray-600 mb-2">
            {startsAt
              ? format(new Date(startsAt), "MMM d, yyyy • h:mm a")
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
