import EventDetails from "@/components/events/EventDetails";
import { trpc } from "@/lib/trpc";
import { useLocalSearchParams } from "expo-router";
import { Skeleton } from "moti/skeleton";
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
      <View className="flex-1 p-5 pb-0 bg-background">
        <Skeleton
          colorMode="light"
          width={300}
          height={40}
          radius={8}
          show={true}
        />
        <View className="pt-3 gap-3">
          <Skeleton
            colorMode="light"
            width={400}
            height={300}
            radius={8}
            show={true}
          />
          <Skeleton
            colorMode="light"
            width={300}
            height={80}
            radius={8}
            show={true}
          />
          <Skeleton
            colorMode="light"
            width={400}
            height={50}
            radius={25}
            show={true}
          />
          <View className="flex-row items-center justify-center gap-3 pt-1">
            <Skeleton
              colorMode="light"
              width={190}
              height={40}
              radius={25}
              show={true}
            />
            <Skeleton
              colorMode="light"
              width={190}
              height={40}
              radius={25}
              show={true}
            />
          </View>
        </View>

        {[...Array(3)].map((_, i) => (
          <View className="pt-3" key={i}>
            <Skeleton
              colorMode="light"
              width={300}
              height={40}
              radius={8}
              show={true}
            />
          </View>
        ))}
      </View>
    );
  }

  if (error || !event) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
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
