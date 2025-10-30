import EventSuggestions from "@/components/EventSuggestions";
import HomeChatSection from "@/components/HomeChatSection";
import React, { useState } from "react";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  // Example event data
  const exampleEvent = {
    id: "1",
    title: "Beach Volleyball Meetup",
    location: "Santa Monica Beach",
    dateTime: new Date("2025-10-26T14:00:00"),
    thumbnailUrl: "../../assets/image.png",
    maxParticipants: 5,
    currentParticipants: 4,
  };

  const [isChatExpanded, setIsChatExpanded] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Chat section */}
      <Animated.View
        // Reanimated will animate the size change when styles/layout change
        layout={LinearTransition.duration(300)}
        style={isChatExpanded ? { flex: 1 } : { height: 220 }} // collapsed vs expanded
      >
        <HomeChatSection onSend={() => setIsChatExpanded(true)} />
      </Animated.View>

      {/* Suggestions fade/slide away when chat expands */}
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
    </SafeAreaView>
  );
};

export default Home;
