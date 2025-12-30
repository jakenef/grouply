import { colors } from "@/lib/theme";
import React from "react";
import { Text, View } from "react-native";

interface BubbleListProps {
  items: string[];
  title?: string;
}

const BubbleList: React.FC<BubbleListProps> = ({ items, title }) => {
  return (
    <View className="my-2 border-border border-2 rounded-lg p-4">
      {title && <Text className="text-xl font-semibold mb-2">{title}</Text>}
      <View className="flex-row flex-wrap gap-2">
        {items &&
          items.map((item, index) => (
            <View
              key={index}
              className="rounded-full px-4 py-2"
              style={{ backgroundColor: colors.accent }}
            >
              <Text className="font-medium" style={{ color: colors.primary }}>
                {item}
              </Text>
            </View>
          ))}
        {!items || (items.length == 0 && <Text>No {title} selected yet.</Text>)}
      </View>
    </View>
  );
};

export default BubbleList;
