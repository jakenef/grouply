import React from "react";
import { Pressable, Text, View } from "react-native";

interface Option {
  label: string;
  value: string;
}

interface SingleSelectProps {
  question: string;
  description?: string;
  options: Option[];
  multiSelect?: false;
  selectedValue: string;
  onSelect: (value: string) => void;
}

interface MultiSelectProps {
  question: string;
  description?: string;
  options: Option[];
  multiSelect: true;
  selectedValues: string[];
  onSelectMultiple: (values: string[]) => void;
  maxAllowedSelections?: number;
}

type MultipleChoiceSelectorProps = SingleSelectProps | MultiSelectProps;

export default function MultipleChoiceSelector(
  props: MultipleChoiceSelectorProps,
) {
  const { question, description, options, multiSelect } = props;

  const isSelected = (value: string) => {
    if (multiSelect) {
      return (props as MultiSelectProps).selectedValues.includes(value);
    }
    return (props as SingleSelectProps).selectedValue === value;
  };

  const [showMaxFeedback, setShowMaxFeedback] = React.useState(false);

  const handlePress = (value: string) => {
    if (multiSelect) {
      const { selectedValues, onSelectMultiple } = props as MultiSelectProps;
      if (selectedValues.includes(value)) {
        onSelectMultiple(selectedValues.filter((v) => v !== value));
        setShowMaxFeedback(false);
      } else {
        if (
          props.maxAllowedSelections === undefined ||
          selectedValues.length < props.maxAllowedSelections
        ) {
          onSelectMultiple([...selectedValues, value]);
          setShowMaxFeedback(false);
        } else {
          setShowMaxFeedback(true);
        }
      }
    } else {
      (props as SingleSelectProps).onSelect(value);
    }
  };

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
            onPress={() => handlePress(option.value)}
            className="flex-row items-center py-3"
          >
            <View
              className={`w-5 h-5 ${multiSelect ? "rounded" : "rounded-full"} border-2 border-muted mr-3 items-center justify-center`}
            >
              {isSelected(option.value) && (
                <View
                  className={`${multiSelect ? "w-3 h-3 rounded-sm" : "w-2.5 h-2.5 rounded-full"} bg-primary`}
                />
              )}
            </View>
            <Text
              className={
                isSelected(option.value) ? "text-primary" : "text-foreground"
              }
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {/* Feedback message for maxAllowedSelections */}
      {multiSelect &&
        props.maxAllowedSelections !== undefined &&
        showMaxFeedback && (
          <Text className="mt-2 text-xs text-danger font-medium">
            You can only select up to {props.maxAllowedSelections} options.
          </Text>
        )}
    </View>
  );
}
