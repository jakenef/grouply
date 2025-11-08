import { Event } from "@/types/Event";
import React from "react";
import { Text, View } from "react-native";
import { EventCard } from "../shared/EventCard";

const exampleEvent: Event = {
  currentParticipants: 4,
  dateTime: new Date(),
  id: "soeiejfaof",
  location: "san fran",
  maxParticipants: 5,
  thumbnailUrl: "idk",
  title: "hiking",
};

const EventSuggestions = () => {
  return (
    <View className="flex-1 p-5">
      <Text className="text-lg font-bold">Event Suggestions</Text>
      <EventCard event={exampleEvent} />
    </View>
  );
};

export default EventSuggestions;
