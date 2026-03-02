import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

interface TroubleshootDropdownProps {
  title: string;
  children: React.ReactNode;
}

const TroubleshootDropdown = ({
  title,
  children,
}: TroubleshootDropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <View className="mb-4">
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center justify-between p-3 bg-card rounded-lg border border-border"
      >
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
        <Text className="text-xl text-muted-foreground">
          {open ? "▲" : "▼"}
        </Text>
      </Pressable>
      {open && <View className="mt-2">{children}</View>}
    </View>
  );
};

export default TroubleshootDropdown;
