import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GrouplyButton from "@/components/GrouplyButton";
import OptionsSelector from "@/components/OptionsSelector";
import RangeSlider from "@/components/RangeSlider";
import SliderSingle from "@/components/SliderSingle";

// Mock data for interests and traits (would come from API in real app)
const MOCK_INTERESTS = [
  { id: "1", label: "Hiking" },
  { id: "2", label: "Movies" },
  { id: "3", label: "Reading" },
  { id: "4", label: "Cooking" },
  { id: "5", label: "Gaming" },
  { id: "6", label: "Photography" },
  { id: "7", label: "Music" },
  { id: "8", label: "Dancing" },
  { id: "9", label: "Sports" },
  { id: "10", label: "Art" },
  { id: "11", label: "Travel" },
  { id: "12", label: "Technology" },
  { id: "13", label: "Yoga" },
  { id: "14", label: "Meditation" },
  { id: "15", label: "Fishing" },
  { id: "16", label: "Gardening" },
  { id: "17", label: "DIY" },
  { id: "18", label: "Board Games" },
  { id: "19", label: "Coding" },
  { id: "20", label: "Coffee" },
];

const MOCK_TRAITS = [
  { id: "1", label: "Adventurous" },
  { id: "2", label: "Creative" },
  { id: "3", label: "Relaxed" },
  { id: "4", label: "Energetic" },
  { id: "5", label: "Intellectual" },
  { id: "6", label: "Funny" },
  { id: "7", label: "Outgoing" },
  { id: "8", label: "Quiet" },
  { id: "9", label: "Spontaneous" },
  { id: "10", label: "Organized" },
  { id: "11", label: "Artistic" },
  { id: "12", label: "Athletic" },
  { id: "13", label: "Analytical" },
  { id: "14", label: "Compassionate" },
  { id: "15", label: "Ambitious" },
];

const PreferencesSetup = () => {
  // State for group size preferences
  const [groupSizeRange, setGroupSizeRange] = useState<[number, number]>([
    3, 6,
  ]);

  // State for interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // State for traits
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  // State for travel distance (single value)
  const [travelDistance, setTravelDistance] = useState<number>(10);

  // State for age preferences
  const [ageRange, setAgeRange] = useState<[number, number]>([21, 35]);

  // Form validation errors
  const [errors, setErrors] = useState<{
    interests?: string;
    traits?: string;
  }>({});

  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: {
      interests?: string;
      traits?: string;
    } = {};

    if (selectedInterests.length < 3) {
      newErrors.interests = "Please select at least 3 interests";
    }

    if (selectedTraits.length < 3) {
      newErrors.traits = "Please select at least 3 traits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    // Validate form
    if (!validateForm()) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // TODO: Implement API call to save preferences

      // For MVP, just log the preferences and navigate to Home
      console.log("Preferences saved:", {
        groupSizeRange,
        selectedInterests,
        selectedTraits,
        maxTravelDistance: travelDistance,
        ageRange,
      });

      // Navigate to main app
      router.replace("/(app)/Home");
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to save preferences. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert travel distance from miles to kilometers
  const milesToKm = (miles: number): number => {
    return Math.round(miles * 1.60934);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center mt-8 mb-8">
          <Text className="text-4xl font-bold text-primary">
            Your Preferences
          </Text>
          <Text className="text-base text-muted mt-2 text-center">
            Help us find the perfect groups for you
          </Text>
        </View>

        {/* Interests Selection */}
        <OptionsSelector
          title="What are some of your interests?"
          options={MOCK_INTERESTS}
          selectedOptions={selectedInterests}
          onSelectionChange={setSelectedInterests}
          minRequired={3}
          allowOther={true}
          error={errors.interests}
        />

        {/* Traits Selection */}
        <OptionsSelector
          title="What kind of person are you?"
          options={MOCK_TRAITS}
          selectedOptions={selectedTraits}
          onSelectionChange={setSelectedTraits}
          minRequired={3}
          allowOther={true}
          error={errors.traits}
        />

        {/* Group Size Range */}
        <RangeSlider
          label="What is your preferred group size?"
          minValue={3}
          maxValue={6}
          minLimit={2}
          maxLimit={9}
          step={1}
          onValuesChange={(values) => setGroupSizeRange(values)}
          formatLabel={(value) => (value === 9 ? "9" : String(value))}
        />

        {/* Max Travel Distance */}
        <SliderSingle
          label="How far are you willing to travel for an event?"
          value={travelDistance}
          minLimit={1}
          maxLimit={50}
          step={1}
          onValueChange={(value) => setTravelDistance(value)}
          formatLabel={(value) => `${value} mi (${milesToKm(value)} km)`}
        />

        {/* Age Range */}
        <RangeSlider
          label="What's your preferred age range for events?"
          minValue={18}
          maxValue={25}
          minLimit={18}
          maxLimit={60}
          step={1}
          onValuesChange={(values) => setAgeRange(values)}
          formatLabel={(value) => (value === 60 ? "60" : String(value))}
        />

        {/* Save and Continue Button */}
        <View className="mb-8 mt-6">
          <GrouplyButton
            label={isSubmitting ? "Saving Preferences..." : "Save & Continue"}
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSaveAndContinue}
            disabled={
              isSubmitting ||
              selectedInterests.length < 3 ||
              selectedTraits.length < 3
            }
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PreferencesSetup;
