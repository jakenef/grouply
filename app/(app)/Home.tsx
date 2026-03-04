import EventSuggestions from "@/app-components/home/EventSuggestions";
import HomeChatSection from "@/app-components/home/HomeChatSection";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";
import { trpc } from "@/lib/trpc";
import { ChatMessage, ChatMessageRole } from "@/shared/types/Chat";
import { ChatEventSuggestion } from "@/shared/types/Event";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Home = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [eventSuggestions, setEventSuggestions] = useState<
    ChatEventSuggestion[] | undefined
  >(undefined);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [channelId, setChannelId] = useState("");
  const { user } = useAuth();
  const sendMessageMutation = trpc.ai.userSendAIMessage.useMutation();
  const insets = useSafeAreaInsets();
  const isChatExpandedRef = useRef(isChatExpanded);

  useEffect(() => {
    setChannelId("");
    isChatExpandedRef.current = isChatExpanded;
  }, [isChatExpanded]);

  const handleSendMessage = async (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: ChatMessageRole.USER,
      body: text,
      authorId: user!.id,
      channelId: channelId,
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsChatExpanded(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        channelId,
        text,
      });
      if (isChatExpandedRef.current) {
        setChannelId(response.channelId);
        const assistantMessage: ChatMessage = {
          id: response.id,
          role: response.role as any,
          body: response.body,
          channelId: response.channelId,
          authorId: response.authorId,
          toolName: response.toolName,
          createdAt: response.createdAt,
        };
        setEventSuggestions(
          response.refreshedEvents?.map((event) => {
            const chatEventSuggestion: ChatEventSuggestion = {
              id: event.event.id,
              startsAt: new Date(event.event.startsAt),
              name: event.event.name,
              formattedLocation: event.event.location.formatted ?? "",
              coverImageUrl: event.event.coverImageUrl,
              numCurrentParticipants: event.event.currentAttendees,
              maxAttendees: event.event.maxAttendees,
            };
            return chatEventSuggestion;
          }),
        );
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error communicating with AI:", error);
      Alert.alert(
        "Something went wrong",
        "We couldn't process your message. Please try again.",
        [{ text: "OK" }],
      );
      // Remove the user message since we couldn't get a response
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();
    setMessages([]);
    setEventSuggestions(undefined);
    setIsChatExpanded(false);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior="padding"
      keyboardVerticalOffset={insets.top}
    >
      <View className="flex-1 bg-background">
        {!isChatExpanded && (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <Text className="color-primary text-4xl font-bold py-3 px-5">
                Grouply
              </Text>
            </View>
          </TouchableWithoutFeedback>
        )}
        {/* Back button - only shown when chat is expanded */}
        {isChatExpanded && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={{
              position: "absolute",
              top: 12,
              left: 16,
              zIndex: 10,
            }}
          >
            <Pressable
              onPress={handleBack}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.background.DEFAULT,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.foreground} />
            </Pressable>
          </Animated.View>
        )}

        {/* Chat section */}
        <Animated.View
          layout={LinearTransition.duration(300)}
          style={
            isChatExpanded
              ? { flex: 1 }
              : {
                  marginHorizontal: 16,
                  marginTop: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  minHeight: 130,
                  overflow: "hidden",
                }
          }
        >
          <HomeChatSection
            messages={messages}
            eventSuggestions={eventSuggestions}
            onSend={handleSendMessage}
            isExpanded={isChatExpanded}
            isLoading={sendMessageMutation.isPending}
            channelId={channelId}
          />
        </Animated.View>

        {/* Event suggestions - fade out when chat expands */}
        {!isChatExpanded && (
          <Animated.View
            layout={LinearTransition.duration(300)}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={{ flex: 1 }}
          >
            <EventSuggestions />
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default Home;
