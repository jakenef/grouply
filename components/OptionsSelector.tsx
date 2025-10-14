import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import SelectableOption from "./SelectableOption";

interface OptionsSelectorProps {
  title: string;
  options: Array<{ id: string; label: string }>;
  selectedOptions: string[];
  onSelectionChange: (newSelection: string[]) => void;
  minRequired?: number;
  allowOther?: boolean;
  error?: string;
}

const OptionsSelector = ({
  title,
  options,
  selectedOptions,
  onSelectionChange,
  minRequired = 0,
  allowOther = false,
  error,
}: OptionsSelectorProps) => {
  const [displayedOptions, setDisplayedOptions] = useState(
    options.slice(0, 12)
  );
  const [otherValue, setOtherValue] = useState("");
  const [otherSelected, setOtherSelected] = useState(false);

  const handleOptionToggle = (id: string) => {
    let newSelection = [...selectedOptions];

    if (newSelection.includes(id)) {
      // Always allow deselection, even if below minRequired
      // The error state will show in the UI
      newSelection = newSelection.filter((item) => item !== id);
    } else {
      newSelection.push(id);
    }

    onSelectionChange(newSelection);
  };

  const handleLoadMore = () => {
    // Load more options (next 12)
    const currentCount = displayedOptions.length;
    setDisplayedOptions(options.slice(0, currentCount + 12));
  };

  const handleOtherToggle = () => {
    setOtherSelected(!otherSelected);
  };

  return (
    <View className="mb-6">
      <Text className="text-base font-semibold text-foreground mb-2">
        {title}
      </Text>

      <View className="flex-row flex-wrap gap-1">
        {displayedOptions.map((option) => (
          <SelectableOption
            key={option.id}
            label={option.label}
            selected={selectedOptions.includes(option.id)}
            onPress={() => handleOptionToggle(option.id)}
          />
        ))}

        {allowOther && (
          <View className="mb-2 mr-2">
            <Pressable
              onPress={handleOtherToggle}
              className={`px-4 py-2 rounded-full border ${
                otherSelected
                  ? "bg-primary border-primary"
                  : "bg-white border-border"
              }`}
            >
              <Text
                className={`text-base ${
                  otherSelected ? "text-white" : "text-foreground"
                }`}
              >
                Other...
              </Text>
            </Pressable>

            {otherSelected && (
              <TextInput
                className="mt-2 bg-white border border-border rounded-xl px-4 py-2 text-foreground"
                placeholder="Add your own..."
                value={otherValue}
                onChangeText={setOtherValue}
              />
            )}
          </View>
        )}
      </View>

      {displayedOptions.length < options.length && (
        <Pressable
          onPress={handleLoadMore}
          className="flex-row items-center mt-3"
        >
          <Text className="text-primary mr-1">Load more</Text>
          <Ionicons name="chevron-down" size={16} color={colors.primary} />
        </Pressable>
      )}

      {minRequired > 0 && (
        <Text
          className={`text-sm mt-2 ${
            selectedOptions.length < minRequired
              ? "text-danger"
              : "text-success"
          }`}
        >
          {selectedOptions.length < minRequired
            ? `Please select at least ${minRequired} options (${selectedOptions.length}/${minRequired})`
            : `${selectedOptions.length} selected ✓`}
        </Text>
      )}

      {error && <Text className="text-sm text-danger mt-1">{error}</Text>}
    </View>
  );
};

export default OptionsSelector;
