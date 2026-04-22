import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import React, { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

interface DateTimePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: "date" | "time" | "datetime";
  containerClassName?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = (props) => {
  const {
    label,
    value,
    onChange,
    mode = "datetime",
    containerClassName = "mb-6",
  } = props;
  const [showPicker, setShowPicker] = useState(false);
  const dateValue =
    value instanceof Date && !isNaN(value.getTime()) ? value : new Date(value);

  const handleChange = (event: any, selectedDate?: Date) => {
    if (event?.type === "dismissed") {
      setShowPicker(false);
      return;
    }
    if (selectedDate) {
      onChange(selectedDate);
      if (Platform.OS !== "ios") {
        setShowPicker(false);
      }
    }
  };

  const togglePicker = () => setShowPicker((prev) => !prev);
  const formatValue = () => {
    if (mode === "date") return format(dateValue, "MMMM d, yyyy");
    if (mode === "time") return format(dateValue, "h:mm a");
    return format(dateValue, "MMMM d, yyyy • h:mm a");
  };

  return (
    <View className={containerClassName}>
      <Text className="text-base font-semibold text-foreground mb-2">
        {label}
      </Text>
      <Pressable
        onPress={togglePicker}
        className="flex-row items-center justify-between px-4 py-3 border border-border rounded-xl bg-white"
      >
        <Text className="text-base text-foreground">{formatValue()}</Text>
        <Ionicons name="calendar" size={20} color={colors.primary} />
      </Pressable>
      {showPicker && (
        <RNDateTimePicker
          value={dateValue}
          mode={mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          themeVariant={Platform.OS === "ios" ? "light" : undefined}
          textColor={Platform.OS === "ios" ? colors.foreground : undefined}
          onChange={handleChange}
        />
      )}
    </View>
  );
};
