import { EventDetailsForm } from "@/components/events/EventDetailsForm";
import { trpc } from "@/lib/trpc";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function EventDetailsEdit() {
  const { channelId } = useLocalSearchParams<{ channelId?: string }>();

  const {
    data: eventFields,
    isLoading,
    error,
  } = trpc.events.generateEventFromChannel.useQuery(
    { channelId: channelId! },
    { enabled: !!channelId && channelId.length > 0 }
  );

  if (isLoading) {
    return (
      <View className="flex-1">
        <Text>Loading...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex-1">
        <Text>Error loading event edit page. {error.message}</Text>
      </View>
    );
  }

  const convertedEventFields = eventFields
    ? {
        ...eventFields,
        startTime: new Date(eventFields.startTime),
        endTime: new Date(eventFields.endTime),
      }
    : undefined;

  return <EventDetailsForm event={convertedEventFields} />;
}
