import { EventCard } from "@/components/EventCard";
import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6">
        <Text className="text-2xl font-bold text-foreground mb-4">Home</Text>
        <Link href={"/(auth)/LandingPage"} className="text-primary mb-4">
          Go back to landing
        </Link>
        {/* Example Event Card */}
        <View className="mt-6">
          <Text className="text-lg font-semibold mb-3">Event Suggestions</Text>
          <EventCard
            event={exampleEvent}
            onJoin={() => console.log("Join pressed")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;
