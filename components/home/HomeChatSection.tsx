import { ChatMessage, ChatMessageRole } from "@/types/Chat";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import CreateEventCard from "../shared/CreateEventCard";
import { EventCard } from "../shared/EventCard";
import GrouplyButton from "../shared/GrouplyButton";

type HomeChatSectionProps = {
  messages: ChatMessage[];
  eventSuggestions: any[] | undefined;
  onSend: (text: string) => void;
  placeholder?: string;
  isExpanded?: boolean;
  isLoading?: boolean;
  channelId?: string;
};

export default function HomeChatSection({
  messages,
  eventSuggestions,
  onSend,
  placeholder = "e.g. find a hiking group this weekend...",
  isExpanded = false,
  isLoading = false,
  channelId,
}: HomeChatSectionProps) {
  const [text, setText] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const inputRef = useRef<TextInput>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!listRef.current) return;
    const t = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      50
    );
    return () => clearTimeout(t);
  }, [messages.length]);

  // Auto-focus input after first message is sent
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [messages.length, isLoading]);

  const handleSend = () => {
    const value = text.trim();
    if (!value || isLoading) {
      // Clear any whitespace/newlines if there's no actual content
      setText("");
      return;
    }
    onSend(value);
    setText("");
  };

  return (
    <View className="flex-1 bg-background>">
      {/* Content area - scrollable messages or empty state */}
      <View className="flex-1">
        {messages.length === 0 ? (
          // Collapsed/empty state
          <View className="justify-center px-4 py-4">
            <Text className="text-lg font-semibold mb-1.5 text-foreground">
              What do you want to do?
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 8,
            }}
            renderItem={({ item, index }) => (
              <Animated.View
                entering={FadeInDown.delay(Math.min(index, 4) * 40)}
                className={`mb-2 py-2.5 px-3 rounded-2xl max-w-[80%] ${
                  item.role === ChatMessageRole.user
                    ? "self-end bg-accent"
                    : "self-start bg-background-darker"
                }`}
              >
                <Text className="text-base text-foreground">{item.body}</Text>
              </Animated.View>
            )}
          />
        )}
      </View>
      {/* Event Suggestions Scroller */}
      {eventSuggestions !== undefined && messages.length !== 0 && (
        <View className="px-3 py-2">
          <FlatList
            data={eventSuggestions}
            renderItem={({ item }) => (
              <View className="px-2">
                <EventCard
                  event={item}
                  onJoin={() =>
                    router.push({
                      pathname: `/(events)/Events/[id]`,
                      params: { id: item.event.id },
                    })
                  }
                />
              </View>
            )}
            horizontal={true}
            ListFooterComponent={
              <View className="px-2">
                <CreateEventCard
                  onClick={() => {
                    router.push({
                      pathname: "/(events)/Events/Edit",
                      params: { channelId },
                    });
                  }}
                  buttonText="Create Event Automatically With AI"
                />
              </View>
            }
          ></FlatList>
        </View>
      )}

      {/* Input bar - always visible */}
      <View className="border-border px-3 py-2">
        <View className="flex-row items-end gap-2">
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="#6d7281"
            returnKeyType="send"
            onSubmitEditing={handleSend}
            multiline
            textAlignVertical="center"
            className="flex-1 min-h-[40px] max-h-[100px] px-3.5 py-2 border border-border rounded-[20px] text-foreground"
          />
          <GrouplyButton
            onPress={handleSend}
            disabled={!text.trim() || isLoading}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            iconOnly={true}
            iconName="send"
          />
        </View>
      </View>
    </View>
  );
}
