import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { FlatList, Text, View } from "react-native";
import CreateEventCard from "../shared/CreateEventCard";
import { EventCard } from "../shared/EventCard";

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
        {[...Array(3)].map((_, i) => (
          <View
            key={i}
            className="flex-row bg-white rounded-xl p-4 shadow-sm mb-4 border-border border-solid border-2"
          >
            {/* Thumbnail Skeleton */}
            <Skeleton
              colorMode="light"
              width={96}
              height={96}
              radius={8}
              show={true}
            />

            {/* Content Skeleton */}
            <View className="flex-1 ml-4">
              {/* Title */}
              <Skeleton
                colorMode="light"
                width="80%"
                height={20}
                radius={4}
                show={true}
              >
                <View className="h-5 mb-2" />
              </Skeleton>

              {/* Location */}
              <Skeleton
                colorMode="light"
                width="60%"
                height={16}
                radius={4}
                show={true}
              >
                <View className="h-4 mb-2" />
              </Skeleton>

              {/* Date & Time */}
              <Skeleton
                colorMode="light"
                width="70%"
                height={16}
                radius={4}
                show={true}
              >
                <View className="h-4 mb-2" />
              </Skeleton>

              {/* Bottom Row */}
              <View className="flex-row items-center justify-between mt-2">
                {/* Participants */}
                <Skeleton
                  colorMode="light"
                  width={80}
                  height={16}
                  radius={4}
                  show={true}
                >
                  <View className="h-4" />
                </Skeleton>

                {/* Join Button */}
                <Skeleton
                  colorMode="light"
                  width={80}
                  height={32}
                  radius={16}
                  show={true}
                >
                  <View className="h-8" />
                </Skeleton>
              </View>
            </View>
          </View>
        ))}
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
