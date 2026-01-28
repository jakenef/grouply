import EventCardRegistered, {
  EventCardRegisteredEvent,
} from "@/app-components/events/EventCardRegistered";
import SkeletonLoadingEvents from "@/app-components/events/SkeletonLoadingEvents";
import GrouplyButton from "@/app-components/shared/GrouplyButton";
import { colors } from "@/lib/theme";
import { trpc } from "@/lib/trpc";
import { useCurrentUser } from "@/lib/useCurrentUserHook";
import { Checkbox } from "expo-checkbox";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

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
    events.filter((event) => new Date(event.startsAt).getTime() <= now),
  ).reverse();

  const upcomingEvents = filterByHost(
    events.filter((event) => new Date(event.startsAt).getTime() > now),
  );

  return (
    <View className="flex-1 bg-background px-4 pt-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-4xl font-semibold">My Events</Text>
        <Pressable
          className="flex-row justify-between items-center"
          onPress={() => setHostedByMe(!hostedByMe)}
        >
          <Text className="text-muted-darker pr-2">Hosted by me</Text>
          <Checkbox
            value={hostedByMe}
            onValueChange={setHostedByMe}
            color={hostedByMe ? colors.primary : undefined}
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
              : { borderBottomWidth: 3, borderColor: colors.background.DEFAULT }
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
              : { borderBottomWidth: 3, borderColor: colors.background.DEFAULT }
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
      {error ? (
        <>
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
        </>
      ) : isLoading ? (
        <SkeletonLoadingEvents />
      ) : (
        <FlatList
          data={showUpcoming ? upcomingEvents : pastEvents}
          refreshing={isRefetching}
          onRefresh={refetch}
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item }) => {
            const event: EventCardRegisteredEvent = {
              id: item.id,
              title: item.name,
              currentParticipants: item.registrations.length,
              isCanceled: item.isCanceled,
              location: item.location.formatted ?? "TBD",
              maxParticipants: item.maxAttendees,
              minParticipants: item.minAttendees,
              startTime: new Date(item.startsAt),
            };
            return <EventCardRegistered event={event} />;
          }}
          ListEmptyComponent={
            <View className="flex-1 p-3 justify-center">
              <Text className="text-2xl text-muted-darker text-center">
                You aren't registered for any events yet. Go to the Home tab to
                join or host one!
              </Text>
              <GrouplyButton
                variant="text"
                color={colors.primary}
                label="Reload"
                onPress={() => refetch()}
              />
            </View>
          }
        ></FlatList>
      )}
    </View>
  );
};

export default Events;
