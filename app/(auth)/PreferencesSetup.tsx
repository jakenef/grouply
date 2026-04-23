import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GrouplyButton from "@/app-components/shared/GrouplyButton";
import MultipleChoiceSelector from "@/app-components/shared/MultipleChoiceSelector";
import OptionsSelector from "@/app-components/shared/OptionsSelector";
import RangeSlider from "@/app-components/shared/RangeSlider";
import SliderSingle from "@/app-components/shared/SliderSingle";
import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { useCurrentUser } from "@/lib/useCurrentUserHook";
import calculateAge from "@/shared/utils/calculateAge";

interface CustomOption {
  id: string;
  label: string;
}

const SectionDivider = ({ label }: { label: string }) => (
  <View className="flex-row items-center my-6">
    <View className="flex-1 h-px bg-border" />
    <Text className="mx-3 text-xs text-muted font-semibold uppercase tracking-widest">
      {label}
    </Text>
    <View className="flex-1 h-px bg-border" />
  </View>
);

const PreferencesSetup = () => {
  const { user, session } = useAuth();
  const { user: currentUser } = useCurrentUser();

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

  // State for age preferences — centered ±5 years around the user's age
  const [ageRange, setAgeRange] = useState<[number, number]>([21, 35]);

  useEffect(() => {
    const age = calculateAge(
      currentUser?.birthday ? new Date(currentUser.birthday) : null,
    );
    if (age) {
      setAgeRange([Math.max(18, age - 5), Math.min(60, age + 5)]);
    }
  }, [currentUser?.birthday]);

  // Form validation errors
  const [errors, setErrors] = useState<{
    interests?: string;
    traits?: string;
    eventEnergy?: string;
    groupRole?: string;
    preferredAtmosphere?: string;
    downtimePreference?: string;
    peopleVibe?: string;
  }>({});

  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const totalScrollable = contentSize.height - layoutMeasurement.height;
    if (totalScrollable > 0) {
      setScrollProgress(
        Math.max(0, Math.min(contentOffset.y / totalScrollable, 1)),
      );
    }
  };

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

  const shuffled = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const shuffledInterests = useMemo(
    () => shuffled(interestsQuery.data ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interestsQuery.data],
  );

  const shuffledTraits = useMemo(
    () => shuffled(traitsQuery.data ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [traitsQuery.data],
  );

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
    const newErrors: typeof errors = {};

    if (eventEnergy.length === 0)
      newErrors.eventEnergy = "Please select at least one option";
    if (!groupRole) newErrors.groupRole = "Please select an option";
    if (!preferredAtmosphere)
      newErrors.preferredAtmosphere = "Please select an option";
    if (!downtimePreference)
      newErrors.downtimePreference = "Please select an option";
    if (!peopleVibe) newErrors.peopleVibe = "Please select an option";

    if (
      (interestsQuery.data?.length ?? 0) > 0 &&
      selectedInterests.length < 5
    ) {
      newErrors.interests = "Please select at least 5 interests";
    }

    if ((traitsQuery.data?.length ?? 0) > 0 && selectedTraits.length < 5) {
      newErrors.traits = "Please select at least 5 traits";
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

      // Navigate to Paywall
      try {
        router.replace("/(auth)/Paywall");
      } catch (navigationError: any) {
        console.error("Error navigating to paywall:", navigationError);
        Alert.alert(
          "Navigation Error",
          "Preferences were saved, but we couldn't open the paywall. Please reopen the app.",
        );
      }
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
      {/* Scroll progress bar */}
      <View className="h-1 w-full bg-border">
        <View
          className="h-full bg-primary"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </View>

      <ScrollView
        className="flex-1 px-8"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
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

        <View className="pb-8">
          <SectionDivider label="Your Vibe" />

          <MultipleChoiceSelector
            {...personalityQuestions.eventEnergy}
            multiSelect
            maxAllowedSelections={2}
            selectedValues={eventEnergy}
            onSelectMultiple={setEventEnergy}
            error={errors.eventEnergy}
          />

          <MultipleChoiceSelector
            {...personalityQuestions.groupRole}
            selectedValue={groupRole}
            onSelect={setGroupRole}
            error={errors.groupRole}
          />

          <MultipleChoiceSelector
            {...personalityQuestions.preferredAtmosphere}
            selectedValue={preferredAtmosphere}
            onSelect={setPreferredAtmosphere}
            error={errors.preferredAtmosphere}
          />

          <MultipleChoiceSelector
            {...personalityQuestions.downtimePreference}
            selectedValue={downtimePreference}
            onSelect={setDowntimePreference}
            error={errors.downtimePreference}
          />

          <MultipleChoiceSelector
            {...personalityQuestions.peopleVibe}
            selectedValue={peopleVibe}
            onSelect={setPeopleVibe}
            error={errors.peopleVibe}
          />

          <SectionDivider label="Your Interests" />

          <OptionsSelector
            title="What kind of things do you enjoy doing?"
            options={shuffledInterests.map((interest) => ({
              id: interest.id,
              label: interest.label,
            }))}
            selectedOptions={selectedInterests}
            onSelectionChange={setSelectedInterests}
            minRequired={interestsQuery.data?.length! > 0 ? 5 : undefined}
            maxAllowed={15}
            allowOther={false}
            error={errors.interests}
            onCustomOptionAdded={(customOption) => {
              setCustomInterests((prev) => [...prev, customOption]);
            }}
          />

          <SectionDivider label="Your Traits" />

          <OptionsSelector
            title="What's your vibe?"
            options={shuffledTraits.map((trait) => ({
              id: trait.id,
              label: trait.label,
            }))}
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

          <SectionDivider label="Event Preferences" />

          <View className="gap-12">
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

            <SliderSingle
              label="How far are you willing to travel for an event?"
              value={travelDistance}
              minLimit={10}
              maxLimit={100}
              step={5}
              onValueChange={(value) => setTravelDistance(value)}
              formatLabel={(value) => `${value} mi (${milesToKm(value)} km)`}
              formatRangeLabel={(value) => `${value} mi`}
            />

            <RangeSlider
              label="What is your preferred age range of other attendees?"
              minValue={ageRange[0]}
              maxValue={ageRange[1]}
              minLimit={18}
              maxLimit={60}
              step={1}
              onValuesChange={(values) => setAgeRange(values)}
              formatLabel={(value) => (value === 60 ? "60" : String(value))}
            />
          </View>

          <View className="mt-6">
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
                eventEnergy.length === 0 ||
                !groupRole ||
                !preferredAtmosphere ||
                !downtimePreference ||
                !peopleVibe ||
                ((interestsQuery.data?.length ?? 0) > 0 &&
                  selectedInterests.length < 5) ||
                ((traitsQuery.data?.length ?? 0) > 0 &&
                  selectedTraits.length < 5)
              }
              isLoading={savePreferencesMutation.isPending}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PreferencesSetup;
