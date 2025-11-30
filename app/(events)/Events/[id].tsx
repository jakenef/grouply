import EventDetails from "@/components/events/EventDetails";
import { trpc } from "@/lib/trpc";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function EventDetailsView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data: event,
    isLoading,
    error,
  } = trpc.events.getEventDetailsFromId.useQuery({
    id: String(id),
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error loading event.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <EventDetails event={event} />
    </View>
  );
}
