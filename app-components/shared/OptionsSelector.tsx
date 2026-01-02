import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SelectableOption from "./SelectableOption";

interface OptionsSelectorProps {
  title: string;
  options: Array<{ id: string; label: string }>;
  selectedOptions: string[];
  onSelectionChange: (newSelection: string[]) => void;
  minRequired?: number;
  allowOther?: boolean;
  error?: string;
  onCustomOptionAdded?: (option: { id: string; label: string }) => void;
}

// TODO: fix bug where on select of an item, the load more items disappear and it all collapses

const OptionsSelector = ({
  title,
  options,
  selectedOptions,
  onSelectionChange,
  minRequired = 0,
  allowOther = false,
  error,
  onCustomOptionAdded,
}: OptionsSelectorProps) => {
  const [displayedOptions, setDisplayedOptions] = useState(
    options.slice(0, 12)
  );
  const [otherValue, setOtherValue] = useState("");
  const [otherSelected, setOtherSelected] = useState(false);
  const [customOptions, setCustomOptions] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const otherInputRef = useRef<TextInput>(null);

  // Update displayed options when options prop changes
  React.useEffect(() => {
    setDisplayedOptions(options.slice(0, 12));
  }, [options]);

  // Focus the text input whenever "Other" is selected
  React.useEffect(() => {
    if (otherSelected && otherInputRef.current) {
      setTimeout(() => otherInputRef.current?.focus(), 100);
    }
  }, [otherSelected]);

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
    setOtherValue(""); // Clear the input when toggling
  };

  const handleAddCustomOption = () => {
    // Validate input
    if (!otherValue.trim()) {
      return; // Don't add empty values
    }

    // Generate a unique ID for the custom option (prefix with 'custom-' to distinguish it)
    const customId = `custom-${Date.now()}-${otherValue
      .replace(/\s+/g, "-")
      .toLowerCase()}`;

    // Add to custom options
    const newCustomOption = { id: customId, label: otherValue.trim() };
    setCustomOptions([...customOptions, newCustomOption]);

    // Add to selected options
    onSelectionChange([...selectedOptions, customId]);

    // Notify parent component of custom option if callback exists
    if (onCustomOptionAdded) {
      onCustomOptionAdded(newCustomOption);
    }

    // Reset the other input and deselect it
    setOtherValue("");
    setOtherSelected(false);
  };

  const handleRemoveCustomOption = (id: string) => {
    // Remove from custom options
    setCustomOptions(customOptions.filter((option) => option.id !== id));

    // Remove from selected options
    onSelectionChange(selectedOptions.filter((optionId) => optionId !== id));
  };

  return (
    <View className="mb-6">
      <Text className="text-base font-semibold text-foreground mb-2">
        {title}
      </Text>

      <View className="flex-row flex-wrap gap-1">
        {/* Predefined options */}
        {displayedOptions.map((option) => (
          <SelectableOption
            key={option.id}
            label={option.label}
            selected={selectedOptions.includes(option.id)}
            onPress={() => handleOptionToggle(option.id)}
          />
        ))}
        {(!displayedOptions || displayedOptions.length == 0) && (
          <Text>No options available.</Text>
        )}

        {/* Custom options added by user */}
        {customOptions.map((option) => (
          <View key={option.id} className="mb-2 mr-2">
            <Pressable
              onPress={() => handleOptionToggle(option.id)}
              className={`flex-row items-center px-4 py-2 rounded-full border ${
                selectedOptions.includes(option.id)
                  ? "bg-primary border-primary"
                  : "bg-white border-border"
              }`}
            >
              <Text
                className={`text-base ${
                  selectedOptions.includes(option.id)
                    ? "text-white"
                    : "text-foreground"
                }`}
              >
                {option.label}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemoveCustomOption(option.id)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                className="ml-2"
              >
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={
                    selectedOptions.includes(option.id)
                      ? "white"
                      : colors.border
                  }
                />
              </TouchableOpacity>
            </Pressable>
          </View>
        ))}

        {/* "Other..." option button */}
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
          </View>
        )}
      </View>

      {/* Separate container for the text input to avoid affecting button layout */}
      {allowOther && otherSelected && (
        <View className="mb-4">
          <View className="relative">
            <TextInput
              ref={otherInputRef}
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-foreground pr-10"
              placeholder="Add your own..."
              value={otherValue}
              onChangeText={setOtherValue}
              returnKeyType="done"
              onSubmitEditing={handleAddCustomOption}
              blurOnSubmit={false}
              multiline={false}
            />
            {otherValue.trim() && (
              <TouchableOpacity
                onPress={handleAddCustomOption}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

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
