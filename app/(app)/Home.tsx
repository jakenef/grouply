import EventSuggestions from "@/app-components/home/EventSuggestions";
import HomeChatSection from "@/app-components/home/HomeChatSection";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";
import { trpc } from "@/lib/trpc";
import { ChatMessage, ChatMessageRole } from "@/shared/types/Chat";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

// TODO: bad word filter

const Home = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [eventSuggestions, setEventSuggestions] = useState<any[] | undefined>(
    undefined
  );
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [channelId, setChannelId] = useState("");
  const { user } = useAuth();
  const sendMessageMutation = trpc.ai.userSendAIMessage.useMutation();

  useEffect(() => {
    setChannelId("");
  }, [isChatExpanded]);

  const handleSendMessage = async (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: ChatMessageRole.user,
      body: text,
      authorId: user!.id,
      channelId: channelId,
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsChatExpanded(true);

    const response = await sendMessageMutation.mutateAsync({ channelId, text });
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
    setEventSuggestions(response.refreshedEvents);
    setMessages((prev) => [...prev, assistantMessage]);
  };

  const handleBack = () => {
    setMessages([]);
    setEventSuggestions(undefined);
    setIsChatExpanded(false);
  };

  return (
    <View className="flex-1 bg-background">
      {!isChatExpanded && (
        <Text className="color-primary text-4xl font-bold py-3 px-5">
          Grouply
        </Text>
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
  );
};

export default Home;
