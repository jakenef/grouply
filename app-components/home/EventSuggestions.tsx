import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import React from "react";
import { FlatList, Text, View } from "react-native";
import SkeletonLoadingEvents from "../events/SkeletonLoadingEvents";
import CreateEventCard from "../shared/CreateEventCard";
import { EventCard, EventCardEvent } from "../shared/EventCard";

const EventSuggestions = () => {
  const {
    data: events = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = trpc.events.getSuggestedEventsFromUser.useQuery();

  if (isLoading) {
    return (
      <View className="flex-1 p-5 pb-0">
        <Text className="text-xl font-bold py-3">Event Suggestions</Text>
        <SkeletonLoadingEvents />
      </View>
    );
  }

  if (error) {
    return (
      <Text className="text-danger p-5">
        Error loading events! {error.message}
      </Text>
    );
  }

  return (
    <View className="flex-1 p-5 pb-0">
      <Text className="text-xl font-bold py-3">Event Suggestions</Text>
      <FlatList
        data={events}
        refreshing={isRefetching}
        onRefresh={refetch}
        renderItem={({ item }) => {
          const eventCardData: EventCardEvent = {
            startsAt: new Date(item.event.startsAt),
            name: item.event.name,
            formattedLocation: item.event.location.formatted ?? "",
            coverImageUrl: item.event.coverImageUrl,
            numCurrentParticipants: item.event.registrations.length,
            maxAttendees: item.event.maxAttendees,
          };
          return (
            <EventCard
              event={eventCardData}
              onJoin={() =>
                router.push({
                  pathname: `/(events)/Events/[id]`,
                  params: { id: item.event.id },
                })
              }
            />
          );
        }}
        ListEmptyComponent={<Text>No events found.</Text>}
        ListFooterComponent={
          <CreateEventCard
            buttonText="Create Event"
            onClick={() =>
              router.push({
                pathname: "/Events/Edit",
              })
            }
            fullWidth={true}
            subtitleText="Connect with like-minded people and meet others"
          />
        }
      ></FlatList>
    </View>
  );
};

export default EventSuggestions;
