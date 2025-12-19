import EventCardRegistered, {
  EventCardRegisteredEvent,
} from "@/components/events/EventCardRegistered";
import { colors } from "@/lib/theme";
import { trpc } from "@/lib/trpc";
import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

const Events = () => {
  const [showUpcoming, setShowUpcoming] = useState(true);
  const {
    data: events = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = trpc.events.getMyRegisteredEvents.useQuery();

  // TODO: sort by recent, and split upcoming / past, and fix ellipses for overflow text

  return (
    <View className="flex-1 bg-background px-4 pt-2">
      <Text className="text-4xl font-semibold">My Events</Text>
      <View className="flex-row items-center py-4">
        <Pressable
          className="flex-1 items-center"
          onPress={() => setShowUpcoming(true)}
          style={
            showUpcoming
              ? {
                  borderBottomWidth: 3,
                  borderColor: colors.primary,
                }
              : undefined
          }
        >
          <View className="pb-3">
            <Text
              className="text-2xl"
              style={showUpcoming ? { color: colors.primary } : undefined}
            >
              Upcoming
            </Text>
          </View>
        </Pressable>

        <Pressable
          className="flex-1 items-center"
          onPress={() => setShowUpcoming(false)}
          style={
            !showUpcoming
              ? {
                  borderBottomWidth: 3,
                  borderColor: colors.primary,
                }
              : undefined
          }
        >
          <View className="pb-3">
            <Text
              className="text-2xl"
              style={!showUpcoming ? { color: colors.primary } : undefined}
            >
              Past
            </Text>
          </View>
        </Pressable>
      </View>
      <FlatList
        data={events}
        refreshing={isRefetching}
        onRefresh={refetch}
        renderItem={({ item }) => {
          const event: EventCardRegisteredEvent = {
            id: item.id,
            title: item.name,
            currentParticipants: item.regs.length,
            isCanceled: item.isCancelled,
            location: item.location.formatted ?? "TBD",
            maxParticipants: item.maxAttendees,
            startTime: new Date(item.startsAt),
          };
          return <EventCardRegistered event={event} />;
        }}
        ListEmptyComponent={<Text>No events found.</Text>}
      ></FlatList>
    </View>
  );
};

export default Events;
