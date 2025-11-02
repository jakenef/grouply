import EventSuggestions from "@/components/EventSuggestions";
import HomeChatSection, { ChatMessage } from "@/components/HomeChatSection";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsChatExpanded(true);

    // Simulate assistant response (replace with actual API call later)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "I'm here to help you find the perfect activity! (This is a placeholder response)",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleBack = () => {
    setMessages([]);
    setIsChatExpanded(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
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
                  overflow: "hidden",
                }
          }
        >
          <HomeChatSection
            messages={messages}
            onSend={handleSendMessage}
            isExpanded={isChatExpanded}
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
    </SafeAreaView>
  );
};

export default Home;
