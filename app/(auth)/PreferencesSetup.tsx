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

  // State for group size preferences (if this is bugged, past jake told you so)
  const [groupSizeRange, setGroupSizeRange] = useState<[number, number]>([
    3, 6,
  ]);

  // State for interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // State for personality preferences
  const [eventEnergy, setEventEnergy] = useState<string[]>([]);
  const [groupRole, setGroupRole] = useState("");
  const [preferredAtmosphere, setPreferredAtmosphere] = useState("");
  const [downtimePreference, setDowntimePreference] = useState("");
  const [peopleVibe, setPeopleVibe] = useState("");

  // Personality questions data - values match trait map keys in onboardingTraitMap.ts
  const personalityQuestions = {
    eventEnergy: {
      question: "What kind of energy do you like at events?",
      options: [
        {
          value: "high_energy",
          label: "High energy — music, games, lots of interaction",
        },
        {
          value: "laid_back",
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
        { value: "hype_person", label: "The one hyping everyone up" },
        { value: "chill_observer", label: "The chill observer" },
        { value: "planner", label: "The planner or organizer" },
        { value: "deep_talker", label: "The deep talker" },
        { value: "funny_light", label: "The one who keeps it funny and light" },
      ],
    },
    preferredAtmosphere: {
      question: "What atmosphere makes you feel most alive?",
      options: [
        { value: "loud_energy", label: "Loud and full of energy" },
        { value: "relaxed_cozy", label: "Relaxed and cozy" },
        { value: "outdoors_free", label: "Outdoors and free" },
        { value: "artsy_inspiring", label: "Artsy and inspiring" },
        { value: "focused_purposeful", label: "Focused and purposeful" },
      ],
    },
    downtimePreference: {
      question: "How do you like to spend your downtime?",
      options: [
        { value: "active_outside", label: "Being active or outside" },
        { value: "new_food_places", label: "Trying new food or places" },
        { value: "creating_learning", label: "Creating or learning something" },
        { value: "close_friends", label: "Hanging with close friends" },
        { value: "recharge_solo", label: "Recharging solo" },
      ],
    },
    peopleVibe: {
      question: "What kind of people do you vibe with most?",
      options: [
        { value: "curious_open", label: "Curious and open-minded" },
        { value: "chill_grounded", label: "Chill and down-to-earth" },
        { value: "driven_goal", label: "Driven and goal-oriented" },
        { value: "playful_spontaneous", label: "Playful and spontaneous" },
        { value: "empathetic_genuine", label: "Empathetic and genuine" },
      ],
    },
  };

  // State for traits
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  // State for travel distance (single value)
  const [travelDistance, setTravelDistance] = useState<number>(20);

  // State for age preferences
  const [ageRange, setAgeRange] = useState<[number, number]>([21, 35]);

  // Form validation errors
  const [errors, setErrors] = useState<{
    interests?: string;
    traits?: string;
  }>({});

  // Set up tRPC mutation
  const utils = trpc.useUtils();
  const savePreferencesMutation = trpc.users.saveUserPreferences.useMutation({
    onSuccess: () => {
      utils.users.getMyUser.invalidate();
    },
  });

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
        ],
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
        ],
      );
    }
  }, [interestsQuery.error, traitsQuery.error]);

  const validateForm = (): boolean => {
    const newErrors: {
      interests?: string;
      traits?: string;
    } = {};

    if (
      (interestsQuery.data?.length ?? 0) > 0 &&
      selectedInterests.length < 3
    ) {
      newErrors.interests = "Please select at least 3 interests";
    }

    if ((traitsQuery.data?.length ?? 0) > 0 && selectedTraits.length < 3) {
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
        ],
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
        maxTravelDist: maxTravelKm,
        personalityAnswers: {
          eventEnergy,
          groupRole,
          preferredAtmosphere,
          downtimePreference,
          peopleVibe,
        },
      });

      // Navigate to main app
      router.replace("/(app)/Home");
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to save preferences. Please try again.",
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
            Help us find the perfect groups for you! The more effort you put in
            here, the better your matches will be!
          </Text>
        </View>

        {/* Interests Selection */}
        <OptionsSelector
          title="What kind of things do you enjoy doing? (Please choose the 10 that you enjoy most)"
          options={
            interestsQuery.data?.map((interest) => ({
              id: interest.id,
              label: interest.label,
            })) || []
          }
          selectedOptions={selectedInterests}
          onSelectionChange={setSelectedInterests}
          minRequired={interestsQuery.data?.length! > 0 ? 10 : undefined}
          maxAllowed={15}
          allowOther={false}
          error={errors.interests}
          onCustomOptionAdded={(customOption) => {
            setCustomInterests((prev) => [...prev, customOption]);
          }}
        />

        {/* Traits Selection */}
        <OptionsSelector
          title="What's your vibe? (Please choose the 5 that best describe you)"
          options={
            traitsQuery.data?.map((trait) => ({
              id: trait.id,
              label: trait.label,
            })) || []
          }
          selectedOptions={selectedTraits}
          onSelectionChange={setSelectedTraits}
          minRequired={traitsQuery.data?.length! > 0 ? 5 : undefined}
          maxAllowed={10}
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
          step={5}
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
            multiSelect
            maxAllowedSelections={2}
            selectedValues={eventEnergy}
            onSelectMultiple={setEventEnergy}
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
              ((interestsQuery.data?.length ?? 0) > 0 &&
                selectedInterests.length < 3) ||
              ((traitsQuery.data?.length ?? 0) > 0 && selectedTraits.length < 3)
            }
            isLoading={savePreferencesMutation.isPending}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default PreferencesSetup;
