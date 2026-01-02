import EventCardRegistered, {
  EventCardRegisteredEvent,
} from "@/app-components/events/EventCardRegistered";
import SkeletonLoadingEvents from "@/app-components/events/SkeletonLoadingEvents";
import { colors } from "@/lib/theme";
import { trpc } from "@/lib/trpc";
import { useCurrentUser } from "@/lib/useCurrentUserHook";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

// TODO: fix upcoming / past visual jump

const Events = () => {
  const { user } = useCurrentUser();
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [hostedByMe, setHostedByMe] = useState(false);

  const {
    data: events = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = trpc.events.getMyRegisteredEvents.useQuery();

  const now = Date.now();

  const filterByHost = (eventsArr: typeof events) =>
    hostedByMe && user?.id
      ? eventsArr.filter((event) => event.organizerId === user.id)
      : eventsArr;

  const pastEvents = filterByHost(
    events.filter((event) => new Date(event.startsAt).getTime() <= now)
  ).reverse();

  const upcomingEvents = filterByHost(
    events.filter((event) => new Date(event.startsAt).getTime() > now)
  );

  // when hostedByMe is true: upcomingEvents.filter((event) => hostId == user.id)

  return (
    <View className="flex-1 bg-background px-4 pt-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-4xl font-semibold">My Events</Text>
        <Pressable
          className="flex-row justify-between items-center"
          onPress={() => setHostedByMe(!hostedByMe)}
        >
          <Text className="text-muted-darker pr-2">Hosted by me</Text>
          <Ionicons
            name={hostedByMe ? "checkbox" : "checkbox-outline"}
            color={colors.primary}
            size={30}
          />
        </Pressable>
      </View>

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
          ListEmptyComponent={
            <Text className="text-2xl text-muted-darker text-center">
              No events found.
            </Text>
          }
        ></FlatList>
      )}
    </View>
  );
};

export default Events;
