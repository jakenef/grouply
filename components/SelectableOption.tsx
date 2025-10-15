import React from "react";
import { Pressable, Text, View } from "react-native";

interface SelectableOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  customBadge?: React.ReactNode;
}

const SelectableOption = ({
  label,
  selected,
  onPress,
  disabled = false,
  customBadge,
}: SelectableOptionProps) => {
  return (
    <View className="flex-row items-center">
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`px-4 py-2 mb-2 mr-1 rounded-full border ${
          selected ? "bg-primary border-primary" : "bg-white border-border"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <Text
          className={`text-base ${selected ? "text-white" : "text-foreground"}`}
        >
          {label}
        </Text>
      </Pressable>
      {customBadge}
    </View>
  );
};

export default SelectableOption;
