import { ChatMessage, ChatMessageRole } from "@/shared/types/Chat";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, Text, TextInput, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import CreateEventCard from "../shared/CreateEventCard";
import { EventCard, EventCardEvent } from "../shared/EventCard";
import GrouplyButton from "../shared/GrouplyButton";

// Customize the AI avatar here:
// Option 1: Use a URL to an image
const AI_AVATAR_URL = null; // e.g. "https://example.com/ai-avatar.png"
// Option 2: If null, will use a default icon

// Typing indicator component
const TypingIndicator = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animationConfig = {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    };

    dot1.value = withRepeat(
      withSequence(
        withTiming(1, animationConfig),
        withTiming(0, animationConfig)
      ),
      -1
    );
    dot2.value = withDelay(
      150,
      withRepeat(
        withSequence(
          withTiming(1, animationConfig),
          withTiming(0, animationConfig)
        ),
        -1
      )
    );
    dot3.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1, animationConfig),
          withTiming(0, animationConfig)
        ),
        -1
      )
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: 0.3 + dot1.value * 0.7,
    transform: [{ translateY: -dot1.value * 4 }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: 0.3 + dot2.value * 0.7,
    transform: [{ translateY: -dot2.value * 4 }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: 0.3 + dot3.value * 0.7,
    transform: [{ translateY: -dot3.value * 4 }],
  }));

  return (
    <View className="flex-row items-center gap-1.5">
      <Animated.View
        style={dot1Style}
        className="w-2 h-2 rounded-full bg-gray-500"
      />
      <Animated.View
        style={dot2Style}
        className="w-2 h-2 rounded-full bg-gray-500"
      />
      <Animated.View
        style={dot3Style}
        className="w-2 h-2 rounded-full bg-gray-500"
      />
    </View>
  );
};

export interface ChatEventSuggestion extends EventCardEvent {
  id: string;
}

type HomeChatSectionProps = {
  messages: ChatMessage[];
  eventSuggestions: ChatEventSuggestion[] | undefined;
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
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const inputRef = useRef<TextInput>(null);

  // Delay showing typing indicator
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowTypingIndicator(true);
      }, 600); // 600ms delay
      return () => clearTimeout(timer);
    } else {
      setShowTypingIndicator(false);
    }
  }, [isLoading]);

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
            <Text className="text-xl font-semibold mb-1.5">
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
              <View
                className={`mb-2 flex-row items-end gap-2 ${
                  item.role === ChatMessageRole.USER
                    ? "self-end flex-row-reverse"
                    : "self-start"
                }`}
              >
                {/* AI Avatar - only show for assistant messages */}
                {item.role === ChatMessageRole.ASSISTANT && (
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#4f47e5",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 2,
                    }}
                  >
                    {AI_AVATAR_URL ? (
                      <Image
                        source={{ uri: AI_AVATAR_URL }}
                        style={{ width: 32, height: 32, borderRadius: 16 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="sparkles" size={16} color="white" />
                    )}
                  </View>
                )}

                {/* Message Bubble */}
                <Animated.View
                  entering={FadeInDown.delay(Math.min(index, 4) * 40)}
                  className={`py-2.5 px-3 rounded-2xl max-w-[80%] ${
                    item.role === ChatMessageRole.USER
                      ? "bg-accent"
                      : "bg-background-darker"
                  }`}
                >
                  <Text className="text-base text-foreground">{item.body}</Text>
                </Animated.View>
              </View>
            )}
            ListFooterComponent={
              showTypingIndicator ? (
                <View
                  style={{
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 8,
                    alignSelf: "flex-start",
                  }}
                >
                  {/* AI Avatar for typing indicator */}
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#4f47e5",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 2,
                    }}
                  >
                    {AI_AVATAR_URL ? (
                      <Image
                        source={{ uri: AI_AVATAR_URL }}
                        style={{ width: 32, height: 32, borderRadius: 16 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="sparkles" size={16} color="white" />
                    )}
                  </View>
                  {/* Typing Indicator */}
                  <View
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 16,
                      backgroundColor: "#f3f4f6",
                    }}
                  >
                    <TypingIndicator />
                  </View>
                </View>
              ) : null
            }
          />
        )}
      </View>
      {/* Event Suggestions Scroller */}
      {eventSuggestions !== undefined && messages.length !== 0 && (
        <View className="px-3 py-2">
          <FlatList
            data={eventSuggestions}
            renderItem={({ item }) => (
              <View className="px-2 w-96">
                <EventCard
                  event={item}
                  onJoin={() =>
                    router.push({
                      pathname: `/(events)/Events/[id]`,
                      params: { id: item.id },
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
      <View className="px-3 py-2 h-20">
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
            scrollEnabled
            textAlignVertical="top"
            className="flex-1 px-3.5 py-2 border border-border rounded-[20px] text-foreground"
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
