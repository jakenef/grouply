import { trpc } from "@/lib/trpc";
import { Event } from "@/types/Event";
import React from "react";
import { FlatList, Text, View } from "react-native";
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
  const {
    data: events = [],
    isLoading,
    error,
  } = trpc.events.getSuggestedEventsFromUser.useQuery();

  if (isLoading) {
    return <Text> Loading... </Text>;
  }

  if (error) {
    return <Text>Error loading events!</Text>;
  }

  return (
    <View className="flex-1 p-5">
      <Text className="text-xl font-bold">Event Suggestions</Text>
      <FlatList
        data={events}
        renderItem={({ item }) => <EventCard event={item} />}
        ListEmptyComponent={<Text>No events found.</Text>}
      ></FlatList>
    </View>
  );
};

export default EventSuggestions;
