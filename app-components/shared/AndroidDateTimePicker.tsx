import { colors } from "@/lib/theme";
import { format } from "date-fns";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import DatePicker from "react-native-date-picker";

interface AndroidDateTimePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  containerClassName?: string;
}

export const AndroidDateTimePicker: React.FC<AndroidDateTimePickerProps> = ({
  label,
  value,
  onChange,
  containerClassName = "mb-6",
}) => {
  const [open, setOpen] = useState(false);

  // Format date/time as 'MMMM d, yyyy • h:mm a' (e.g., January 1, 2026 • 3:45 PM)
  const formattedValue = format(value, "MMMM d, yyyy • h:mm a");

  return (
    <View className={containerClassName}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: colors.foreground,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#000",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {formattedValue}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          backgroundColor: colors.background.DEFAULT,
          borderColor: colors.border,
          borderWidth: 1.5,
          borderRadius: 12,
          paddingVertical: 12,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text style={{ color: "#000", fontSize: 16, fontWeight: "bold" }}>
          Select Date & Time
        </Text>
      </Pressable>
      <DatePicker
        modal
        open={open}
        date={value}
        mode="datetime"
        onConfirm={(date) => {
          setOpen(false);
          onChange(date);
        }}
        onCancel={() => setOpen(false)}
        theme="light"
      />
    </View>
  );
};
