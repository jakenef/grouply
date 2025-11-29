import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface EventDetailsProps {
  name: string;
  description: string;
}

export default function EventDetails(props: EventDetailsProps) {
  return (
    <View className="flex-1">
      <View className="flex-1 justify-between">
        <Ionicons name="arrow-back-circle-sharp" />
        <Ionicons name="share" />
      </View>
      <Text className="text-2xl font-bold">{props.name}</Text>
      <Text className="text-lg text-muted">{props.description}</Text>
    </View>
  );
}
