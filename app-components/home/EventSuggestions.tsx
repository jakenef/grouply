import { colors } from "@/lib/theme";
import { trpc } from "@/lib/trpc";
import { EventCardEvent } from "@/shared/types/Event";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import CreateEventCard from "../events/CreateEventCard";
import { EventCard } from "../events/EventCard";
import SkeletonLoadingEvents from "../events/SkeletonLoadingEvents";
import GrouplyButton from "../shared/GrouplyButton";

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
      <View className="flex-1 p-5 pb-0">
        <Text className="text-xl font-bold py-3">Event Suggestions</Text>

        {isRefetching ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            <Text className="text-danger text-center p-5">
              Error loading events! {error?.message}
            </Text>
            <GrouplyButton
              variant="text"
              color={colors.danger.DEFAULT}
              label="Retry"
              onPress={() => refetch()}
            />
          </>
        )}
      </View>
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
        ListEmptyComponent={
          <View className="flex-1 p-3">
            <Text className="text-lg text-center">
              No event suggestions are available in your area right now, click
              below to create one!
            </Text>
          </View>
        }
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
