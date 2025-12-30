import { Text, View } from "react-native";

export interface EventStatusProps {
  status: "confirmed" | "pending" | "canceled";
}

export default function eventStatus(props: EventStatusProps) {
  if (props.status == "confirmed") {
    return (
      <View className="bg-success-accent px-6 py-2 rounded-full">
        <Text className="text-success">Confirmed</Text>
      </View>
    );
  } else if (props.status == "pending") {
    return (
      <View className="bg-warning-accent px-6 py-2 rounded-full">
        <Text className="text-warning">Pending</Text>
      </View>
    );
  } else {
    return (
      <View className="bg-danger-accent px-6 py-2 rounded-full">
        <Text className="text-danger">Canceled</Text>
      </View>
    );
  }
}
