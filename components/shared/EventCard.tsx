import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Event } from '../types/Event';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
  onJoin?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onJoin }) => {
  return (
    <View className="flex-row bg-white rounded-xl p-4 shadow-sm mb-4">
      {/* Thumbnail */}
      <Image
        source={{ uri: event.thumbnailUrl }}
        className="w-24 h-24 rounded-lg mr-4"
      />
      
      {/* Content */}
      <View className="flex-1">
        {/* Title */}
        <Text className="text-lg font-semibold mb-1">{event.title}</Text>
        
        {/* Location */}
        <Text className="text-gray-600 mb-1">{event.location}</Text>
        
        {/* Date & Time */}
        <Text className="text-gray-600 mb-2">
          {format(event.dateTime, 'MMM d, yyyy • h:mm a')}
        </Text>
        
        {/* Bottom Row */}
        <View className="flex-row items-center justify-between">
          {/* Participants */}
          <Text className="text-gray-700">
            {event.currentParticipants}/{event.maxParticipants} people
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