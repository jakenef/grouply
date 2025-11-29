import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import React from "react";
import { FlatList, Text, View } from "react-native";
import CreateEventCard from "../shared/CreateEventCard";
import { EventCard } from "../shared/EventCard";

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
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onJoin={() =>
              router.push({
                pathname: `/(events)/Events/[id]`,
                params: { id: item.event.id },
              })
            }
          />
        )}
        ListEmptyComponent={<Text>No events found.</Text>}
        ListFooterComponent={
          <CreateEventCard buttonText="Create Event" onClick={() => null} />
        }
      ></FlatList>
    </View>
  );
};

export default EventSuggestions;
