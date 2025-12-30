import { format } from "date-fns";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import EventStatus, { EventStatusProps } from "./EventStatus";

export interface EventCardRegisteredEvent {
  id: string;
  startTime: Date;
  title: string;
  location: string;
  currentParticipants: number;
  maxParticipants: number;
  minParticipants: number;
  isCanceled: boolean;
}

interface EventCardRegisteredProps {
  event: EventCardRegisteredEvent;
}

export default function eventCardRegistered(props: EventCardRegisteredProps) {
  let eventStatusProps: EventStatusProps = {
    status:
      props.event.currentParticipants >= props.event.minParticipants
        ? "confirmed"
        : "pending",
  };

  if (props.event.isCanceled) {
    eventStatusProps.status = "canceled";
  }

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: `/(events)/Events/[id]`,
          params: { id: props.event.id },
        })
      }
    >
      <View className="flex-row bg-white rounded-xl overflow-hidden shadow-sm mb-4 border-border border-solid border-2 h-38">
        <View className="flex-1 p-4 pt-2">
          <View className="flex-row justify-between items-center">
            {/* Title */}
            <View className="flex-1 mr-2">
              <Text className="text-xl font-semibold mb-1" numberOfLines={1}>
                {props.event.title}
              </Text>
            </View>

            <EventStatus status={eventStatusProps.status} />
          </View>

          {/* Location */}
          <Text className="text-gray-600 mb-1" numberOfLines={1}>
            {props.event.location}
          </Text>

          {/* Date & Time */}
          <Text className="text-gray-600 mb-2">
            {props.event.startTime
              ? format(new Date(props.event.startTime), "MMM d, yyyy • h:mm a")
              : "Date TBD"}
          </Text>

          {/* Bottom Row */}
          <View className="flex-row items-center justify-between">
            {/* Participants */}
            <Text className="text-gray-700">
              {props.event.currentParticipants}/{props.event.maxParticipants}{" "}
              people
            </Text>

            {/* Details Button */}
            <View className="bg-background px-6 py-2 rounded-full border-2 border-primary">
              <Text className="text-primary font-medium">View Details</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
