import React from "react";
import { Text, View } from "react-native";
import GrouplyButton from "./GrouplyButton";

interface homeChatSectionProps {
  onSend: () => void;
}

const HomeChatSection = (props: homeChatSectionProps) => {
  return (
    <View className="flex-1">
      <Text>TEXT SECTION AHARJAHF</Text>
      <GrouplyButton onPress={props.onSend} label="send" />
    </View>
  );
};

export default HomeChatSection;
