import { trpc } from "@/lib/trpc";
import { Event } from "@/types/Event";
import React from "react";
import { FlatList, Text, View } from "react-native";
import CreateEventCard from "../shared/CreateEventCard";
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
    <View className="flex-1 p-5 pb-0">
      <Text className="text-xl font-bold py-3">Event Suggestions</Text>
      <FlatList
        data={events}
        renderItem={({ item }) => <EventCard event={item} />}
        ListEmptyComponent={<Text>No events found.</Text>}
        ListFooterComponent={
          <CreateEventCard buttonText="Create Event" onClick={() => null} />
        }
      ></FlatList>
    </View>
  );
};

export default EventSuggestions;
