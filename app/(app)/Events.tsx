import EventCardRegistered, {
  EventCardRegisteredEvent,
} from "@/app-components/events/EventCardRegistered";
import SkeletonLoadingEvents from "@/app-components/events/SkeletonLoadingEvents";
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

  const now = Date.now();
  const pastEvents = events.filter(
    (event) => new Date(event.startsAt).getTime() <= now
  );
  const upcomingEvents = events.filter(
    (event) => new Date(event.startsAt).getTime() > now
  );
  pastEvents.reverse();

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
      {isLoading ? (
        <SkeletonLoadingEvents />
      ) : (
        <FlatList
          data={showUpcoming ? upcomingEvents : pastEvents}
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
              minParticipants: item.minAttendees,
              startTime: new Date(item.startsAt),
            };
            return <EventCardRegistered event={event} />;
          }}
          ListEmptyComponent={<Text>No events found.</Text>}
        ></FlatList>
      )}
    </View>
  );
};

export default Events;
