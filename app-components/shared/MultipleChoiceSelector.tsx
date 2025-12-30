import React from "react";
import { Pressable, Text, View } from "react-native";

interface Option {
  label: string;
  value: string;
}

interface MultipleChoiceSelectorProps {
  question: string;
  description?: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export default function MultipleChoiceSelector({
  question,
  description,
  options,
  selectedValue,
  onSelect,
}: MultipleChoiceSelectorProps) {
  return (
    <View className="mb-6">
      <Text className="text-base font-semibold mb-2 text-foreground">
        {question}
      </Text>
      {description && (
        <Text className="text-sm mb-4 text-muted-foreground">
          {description}
        </Text>
      )}
      <View className="space-y-3">
        {options.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            className="flex-row items-center py-3"
          >
            <View className="w-5 h-5 rounded-full border-2 border-muted mr-3 items-center justify-center">
              {selectedValue === option.value && (
                <View className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </View>
            <Text
              className={
                selectedValue === option.value
                  ? "text-primary"
                  : "text-foreground"
              }
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
