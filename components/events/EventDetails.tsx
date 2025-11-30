import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { router } from "expo-router";
import { Text, View } from "react-native";

interface EventDetailsProps {
  event: any;
}

export default function EventDetails(props: EventDetailsProps) {
  const formattedStart = format(
    props.event.startTime,
    "eeee, MMMM d, yyyy • h:mm a - "
  );
  const formattedEndTime = format(props.event.endTime, "h:mm a");
  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between sticky p-3">
        <Ionicons
          name="arrow-back-circle-outline"
          size={30}
          onPress={() => router.back()}
        />
        <Ionicons name="share-outline" size={30} />
      </View>
      <View className="flex-1 p-4 pt-1">
        <Text className="text-3xl font-bold">{props.event.name}</Text>
        <View className="flex-row items-center py-2">
          <Ionicons
            name="calendar"
            color={colors.primary}
            size={15}
            className="pr-2"
          />
          <Text className="text-lg text-muted">
            {formattedStart + formattedEndTime}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons
            name="location"
            color={colors.primary}
            size={15}
            className="pr-2"
          />
          <Text className="text-lg text-muted">Santa Monica</Text>
        </View>
        <Text> Pictures </Text>
        <Text className="text-lg text-muted py-5">
          {props.event.description}
        </Text>
        <View className="bg-gray-100 rounded-md">
          <Ionicons name="people" size={25} color={colors.primary} />
        </View>
      </View>
    </View>
  );
}
