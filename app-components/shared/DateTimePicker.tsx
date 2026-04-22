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
  const [androidPickerMode, setAndroidPickerMode] = useState<"date" | "time">(
    "date"
  );
  const [androidDraftDate, setAndroidDraftDate] = useState<Date | null>(null);
  const dateValue =
    value instanceof Date && !isNaN(value.getTime()) ? value : new Date(value);
  const isAndroidDateTime = Platform.OS === "android" && mode === "datetime";

  const mergeDateParts = (baseDate: Date, datePart: Date) => {
    const mergedDate = new Date(baseDate);
    mergedDate.setFullYear(
      datePart.getFullYear(),
      datePart.getMonth(),
      datePart.getDate()
    );
    return mergedDate;
  };

  const mergeTimeParts = (baseDate: Date, timePart: Date) => {
    const mergedDate = new Date(baseDate);
    mergedDate.setHours(
      timePart.getHours(),
      timePart.getMinutes(),
      timePart.getSeconds(),
      timePart.getMilliseconds()
    );
    return mergedDate;
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (event?.type === "dismissed") {
      setShowPicker(false);
      setAndroidPickerMode("date");
      setAndroidDraftDate(null);
      return;
    }

    if (selectedDate) {
      if (isAndroidDateTime) {
        if (androidPickerMode === "date") {
          const nextDraftDate = mergeDateParts(dateValue, selectedDate);
          setAndroidDraftDate(nextDraftDate);
          setAndroidPickerMode("time");
          return;
        }

        const baseDate = androidDraftDate ?? dateValue;
        onChange(mergeTimeParts(baseDate, selectedDate));
        setAndroidDraftDate(null);
        setAndroidPickerMode("date");
        setShowPicker(false);
        return;
      }

      onChange(selectedDate);
      if (Platform.OS !== "ios") {
        setShowPicker(false);
      }
    }
  };

  const togglePicker = () => {
    if (isAndroidDateTime) {
      setAndroidDraftDate(null);
      setAndroidPickerMode("date");
      setShowPicker(true);
      return;
    }

    setShowPicker((prev) => !prev);
  };

  const formatValue = () => {
    if (mode === "date") return format(dateValue, "MMMM d, yyyy");
    if (mode === "time") return format(dateValue, "h:mm a");
    return format(dateValue, "MMMM d, yyyy • h:mm a");
  };

  const pickerValue =
    isAndroidDateTime && androidPickerMode === "time"
      ? androidDraftDate ?? dateValue
      : dateValue;
  const pickerMode = isAndroidDateTime ? androidPickerMode : mode;

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
          value={pickerValue}
          mode={pickerMode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          themeVariant={Platform.OS === "ios" ? "light" : undefined}
          textColor={Platform.OS === "ios" ? colors.foreground : undefined}
          onChange={handleChange}
        />
      )}
    </View>
  );
};
