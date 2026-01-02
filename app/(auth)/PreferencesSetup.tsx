import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GrouplyButton from "@/app-components/shared/GrouplyButton";
import MultipleChoiceSelector from "@/app-components/shared/MultipleChoiceSelector";
import OptionsSelector from "@/app-components/shared/OptionsSelector";
import RangeSlider from "@/app-components/shared/RangeSlider";
import SliderSingle from "@/app-components/shared/SliderSingle";
import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";

// Use real data from the backend
interface Interest {
  id: string;
  label: string;
  slug: string;
}

interface Trait {
  id: string;
  label: string;
  slug: string;
  desc?: string;
}

interface CustomOption {
  id: string;
  label: string;
}

const PreferencesSetup = () => {
  const { user, session } = useAuth();

  // Fetch interests and traits from the backend (approved only)
  const interestsQuery = trpc.interests.getAllApprovedInterests.useQuery();
  const traitsQuery = trpc.traits.getAllApprovedTraits.useQuery();

  // Track custom options for sending to backend
  const [customInterests, setCustomInterests] = useState<CustomOption[]>([]);
  const [customTraits, setCustomTraits] = useState<CustomOption[]>([]);

  // State for group size preferences
  const [groupSizeRange, setGroupSizeRange] = useState<[number, number]>([
    3, 6,
  ]);

  // State for interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // State for personality preferences
  const [eventEnergy, setEventEnergy] = useState("");
  const [groupRole, setGroupRole] = useState("");
  const [preferredAtmosphere, setPreferredAtmosphere] = useState("");
  const [downtimePreference, setDowntimePreference] = useState("");
  const [peopleVibe, setPeopleVibe] = useState("");

  // Personality questions data
  const personalityQuestions = {
    eventEnergy: {
      question: "What kind of energy do you like at events?",
      options: [
        {
          value: "high",
          label: "High energy — music, games, lots of interaction",
        },
        {
          value: "laid-back",
          label: "Laid back — chill conversations, relaxed setting",
        },
        {
          value: "thoughtful",
          label: "Thoughtful — deeper talks, learning something new",
        },
        { value: "active", label: "Active — moving, playing, exploring" },
        { value: "balanced", label: "Balanced — a mix of calm and excitement" },
      ],
    },
    groupRole: {
      question: "How do you usually show up in a group?",
      options: [
        { value: "energizer", label: "The one hyping everyone up" },
        { value: "observer", label: "The chill observer" },
        { value: "organizer", label: "The planner or organizer" },
        { value: "deep-talker", label: "The deep talker" },
        { value: "entertainer", label: "The one who keeps it funny and light" },
      ],
    },
    preferredAtmosphere: {
      question: "What atmosphere makes you feel most alive?",
      options: [
        { value: "energetic", label: "Loud and full of energy" },
        { value: "cozy", label: "Relaxed and cozy" },
        { value: "outdoors", label: "Outdoors and free" },
        { value: "artsy", label: "Artsy and inspiring" },
        { value: "focused", label: "Focused and purposeful" },
      ],
    },
    downtimePreference: {
      question: "How do you like to spend your downtime?",
      options: [
        { value: "active", label: "Being active or outside" },
        { value: "exploring", label: "Trying new food or places" },
        { value: "creating", label: "Creating or learning something" },
        { value: "social", label: "Hanging with close friends" },
        { value: "solo", label: "Recharging solo" },
      ],
    },
    peopleVibe: {
      question: "What kind of people do you vibe with most?",
      options: [
        { value: "curious", label: "Curious and open-minded" },
        { value: "chill", label: "Chill and down-to-earth" },
        { value: "driven", label: "Driven and goal-oriented" },
        { value: "playful", label: "Playful and spontaneous" },
        { value: "empathetic", label: "Empathetic and genuine" },
      ],
    },
  };

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

  // Set up tRPC mutation
  const savePreferencesMutation =
    trpc.users.saveUserAndUserProfilePreferences.useMutation();

  // If user is not authenticated, redirect to login
  useEffect(() => {
    if (!session) {
      Alert.alert(
        "Authentication Required",
        "You must be logged in to complete your profile.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/LandingPage"),
          },
        ]
      );
    }
  }, [session]);

  // Determine if data is still loading
  const isLoading = interestsQuery.isLoading || traitsQuery.isLoading;

  // Handle data fetch errors
  useEffect(() => {
    if (interestsQuery.error || traitsQuery.error) {
      Alert.alert(
        "Error",
        "Failed to load interests and traits. Please try again.",
        [
          {
            text: "Retry",
            onPress: () => {
              interestsQuery.refetch();
              traitsQuery.refetch();
            },
          },
        ]
      );
    }
  }, [interestsQuery.error, traitsQuery.error]);

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

    // Make sure user is authenticated
    if (!session || !user) {
      Alert.alert(
        "Authentication Required",
        "You must be logged in to save your preferences.",
        [
          {
            text: "Go to Login",
            onPress: () => router.replace("/(auth)/LandingPage"),
          },
        ]
      );
      return;
    }

    try {
      // Convert miles to kilometers for backend storage
      const maxTravelKm = milesToKm(travelDistance);

      // Call the tRPC mutation to save preferences
      await savePreferencesMutation.mutateAsync({
        interests: selectedInterests,
        traits: selectedTraits,
        customInterests: customInterests,
        customTraits: customTraits,
        preferredGroupSizeMin: groupSizeRange[0],
        preferredGroupSizeMax: groupSizeRange[1],
        preferredAgeMin: ageRange[0],
        preferredAgeMax: ageRange[1],
        maxTravelDist: maxTravelKm, // Store in km in the database
      });

      // Navigate to main app
      router.replace("/(app)/Home");
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to save preferences. Please try again."
      );
    }
  };

  // Convert travel distance from miles to kilometers
  const milesToKm = (miles: number): number => {
    return Math.round(miles * 1.60934);
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600 text-lg mb-4">
            Loading preferences data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (interestsQuery.error || traitsQuery.error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-red-500 text-lg mb-4">
            Error loading preferences data.
          </Text>
          <GrouplyButton
            label="Retry"
            onPress={() => {
              interestsQuery.refetch();
              traitsQuery.refetch();
            }}
            variant="primary"
            style={{ width: 120 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-background">
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
          title="What kind of things do you enjoy doing?"
          options={
            interestsQuery.data?.map((interest) => ({
              id: interest.id,
              label: interest.label,
            })) || []
          }
          selectedOptions={selectedInterests}
          onSelectionChange={setSelectedInterests}
          minRequired={3}
          allowOther={false}
          error={errors.interests}
          onCustomOptionAdded={(customOption) => {
            setCustomInterests((prev) => [...prev, customOption]);
          }}
        />

        {/* Traits Selection */}
        <OptionsSelector
          title="What's your vibe?"
          options={
            traitsQuery.data?.map((trait) => ({
              id: trait.id,
              label: trait.label,
            })) || []
          }
          selectedOptions={selectedTraits}
          onSelectionChange={setSelectedTraits}
          minRequired={3}
          allowOther={false}
          error={errors.traits}
          onCustomOptionAdded={(customOption) => {
            setCustomTraits((prev) => [...prev, customOption]);
          }}
        />

        {/* Group Size Range */}
        <RangeSlider
          label="What is your preferred group size?"
          minValue={3}
          maxValue={6}
          minLimit={2}
          maxLimit={12}
          step={1}
          onValuesChange={(values) => setGroupSizeRange(values)}
          formatLabel={(value) => (value === 9 ? "9" : String(value))}
        />

        {/* Max Travel Distance */}
        <SliderSingle
          label="How far are you willing to travel for an event?"
          value={travelDistance}
          minLimit={10}
          maxLimit={100}
          step={1}
          onValueChange={(value) => setTravelDistance(value)}
          formatLabel={(value) => `${value} mi (${milesToKm(value)} km)`}
        />

        {/* Age Range */}
        <RangeSlider
          label="What is your preferred age range of other attendees?"
          minValue={18}
          maxValue={25}
          minLimit={18}
          maxLimit={60}
          step={1}
          onValuesChange={(values) => setAgeRange(values)}
          formatLabel={(value) => (value === 60 ? "60" : String(value))}
        />

        {/* Personality Questions */}
        <View className="mt-6">
          <MultipleChoiceSelector
            {...personalityQuestions.eventEnergy}
            selectedValue={eventEnergy}
            onSelect={setEventEnergy}
          />

          <MultipleChoiceSelector
            {...personalityQuestions.groupRole}
            selectedValue={groupRole}
            onSelect={setGroupRole}
          />

          <MultipleChoiceSelector
            {...personalityQuestions.preferredAtmosphere}
            selectedValue={preferredAtmosphere}
            onSelect={setPreferredAtmosphere}
          />

          <MultipleChoiceSelector
            {...personalityQuestions.downtimePreference}
            selectedValue={downtimePreference}
            onSelect={setDowntimePreference}
          />

          <MultipleChoiceSelector
            {...personalityQuestions.peopleVibe}
            selectedValue={peopleVibe}
            onSelect={setPeopleVibe}
          />
        </View>

        {/* Save and Continue Button */}
        <View className="mb-8 mt-6">
          <GrouplyButton
            label={
              savePreferencesMutation.isPending
                ? "Saving Preferences..."
                : "Save & Continue"
            }
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSaveAndContinue}
            disabled={
              savePreferencesMutation.isPending ||
              selectedInterests.length < 3 ||
              selectedTraits.length < 3
            }
            isLoading={savePreferencesMutation.isPending}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default PreferencesSetup;
