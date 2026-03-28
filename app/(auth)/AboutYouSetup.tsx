import FormField from "@/app-components/shared/FormField";
import LocationPicker, {
  LocationData,
} from "@/app-components/shared/LocationPicker";
import ProfileImagePicker from "@/app-components/shared/ProfileImagePicker";
import { useAuth } from "@/lib/auth";
import uploadImageUri from "@/lib/storage";
import { colors } from "@/lib/theme";
import { trpc } from "@/lib/trpc";
import calculateAge from "@/shared/utils/calculateAge";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GrouplyButton from "../../app-components/shared/GrouplyButton";

type Gender = "MALE" | "FEMALE" | "OTHER" | null;

const AboutYouSetup = () => {
  const { user: authUser, session } = useAuth(); // Get authentication context
  const insets = useSafeAreaInsets();
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [bio, setBio] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState<Gender>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<{
    displayName?: string;
    birthday?: string;
    gender?: string;
    location?: string;
  }>({});

  // If user is not authenticated, redirect to login
  useEffect(() => {
    if (!session && !isSubmitting) {
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

  // Set up tRPC mutation
  const utils = trpc.useUtils();
  const createUserMutation = trpc.users.createUser.useMutation({
    onSuccess: () => {
      utils.users.getMyUser.invalidate();
    },
  });

  const onBirthdayChange = (event: any, selectedDate?: Date) => {
    // On iOS, the spinner fires onChange continuously as you scroll
    // We should update the date in real-time but NOT close the picker
    if (Platform.OS === "ios" && selectedDate) {
      setDate(selectedDate);
      const formattedDate = format(selectedDate, "MMMM d, yyyy");
      setBirthday(formattedDate);
      // Don't close the picker - let handleOutsideTouch handle that
      return;
    }

    // On Android, only update when user confirms
    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
      const formattedDate = format(selectedDate, "MMMM d, yyyy");
      setBirthday(formattedDate);
    }
    
    // Close picker after Android confirmation or dismissal
    setShowDatePicker(false);
  };

  const toggleDatePicker = () => {
    setShowDatePicker((prevState) => !prevState);
  };

  const handleLocationChange = (locationData: LocationData | null) => {
    if (locationData) {
      // Set the formatted location name to the state
      setLocation(locationData);
    } else {
      // Clear the location if null is passed
      setLocation(null);
      console.log("Location cleared or not selected");
    }
  };

  const validateForm = () => {
    const newErrors: {
      givenName?: string;
      familyName?: string;
      birthday?: string;
      gender?: string;
      location?: string;
    } = {};

    if (!givenName.trim()) {
      newErrors.givenName = "First name is required";
    }

    if (!familyName.trim()) {
      newErrors.familyName = "Last name is required";
    }

    if (!birthday) {
      newErrors.birthday = "Birthday is required";
    } else if ((calculateAge(date) ?? 0) < 18) {
      newErrors.birthday = "User must be at least 18 to use Grouply";
    }

    if (!gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!location) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    // Check if user is authenticated
    if (!session || !authUser) {
      Alert.alert(
        "Authentication Required",
        "You must be logged in to complete your profile.",
        [
          {
            text: "Go to Login",
            onPress: () => router.replace("/(auth)/LandingPage"),
          },
        ],
      );
      return;
    }

    // Validate form
    if (!validateForm()) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // If the user selected an avatar, upload it first and get a public URL
      let avatarUrlToSend: string | undefined = undefined;
      if (avatarUri) {
        try {
          const { publicUrl } = await uploadImageUri(avatarUri, {
            bucket: "avatars",
            userId: authUser?.id,
            maxSizeBytes: 1.5 * 1024 * 1024,
          });
          avatarUrlToSend = publicUrl;
        } catch (err: any) {
          console.error("Error uploading avatar:", err);
          Alert.alert(
            "Upload error",
            err?.message || "Failed to upload avatar. Please try again.",
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Call the mutation with the form data (include avatarUrl if present)
      await createUserMutation.mutateAsync({
        givenName: givenName,
        familyName: familyName,
        birthday: date, // Send the actual Date object, not the formatted string
        gender: gender as "MALE" | "FEMALE" | "OTHER", // Type assertion since we validated gender is not null
        location: location as LocationData, // Type assertion since we validated location is not null
        bio: bio || undefined, // Only send if not empty
        avatarUrl: avatarUrlToSend,
      });

      // Navigate to preferences setup on success
      router.replace("/(auth)/PreferencesSetup");
    } catch (error: any) {
      console.error("Error creating profile:", error);

      // Check if it's an authentication error
      if (error.message && error.message.includes("must be logged in")) {
        Alert.alert(
          "Session Expired",
          "Your login session has expired. Please log in again.",
          [
            {
              text: "Go to Login",
              onPress: () => router.replace("/(auth)/LandingPage"),
            },
          ],
        );
      } else {
        // Show the actual error message from backend (includes profanity errors)
        const errorMessage = error.message || "Failed to create your profile. Please try again.";
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const genderOptions: Gender[] = ["MALE", "FEMALE", "OTHER"];

  return (
    <View className="flex-1 bg-background">
      <Pressable onPress={() => router.push("/(app)/Home")} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          className="flex-1 px-8"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
            {/* Header */}
            <View className="items-center mt-8 mb-8">
              <Text className="text-4xl font-bold text-primary">About You</Text>
              <Text className="text-base text-muted mt-2 text-center">
                Tell us a bit about yourself to get started
              </Text>
            </View>

            {/* Avatar Upload */}
            <View className="items-center mb-8">
              <ProfileImagePicker value={avatarUri} onChange={setAvatarUri} />
            </View>

            {/* Given Name */}
            <FormField
              label="First Name"
              value={givenName}
              onChangeText={setGivenName}
              placeholder="John"
              error={errors.displayName}
            />

            {/* Family Name */}
            <FormField
              label="Last Name"
              value={familyName}
              onChangeText={setFamilyName}
              placeholder="Doe"
              error={errors.displayName}
            />

            {/* Birthday */}
            <View className="mb-6 flex-col">
              <Text className="text-base font-semibold text-foreground mb-2">
                Birthday
              </Text>
              <Pressable
                className={`bg-white border rounded-xl px-4 py-3 flex-row items-center justify-between ${
                  errors.birthday ? "border-danger" : "border-border"
                }`}
                onPress={toggleDatePicker}
              >
                <Text
                  className={`text-base ${
                    birthday ? "text-foreground" : "text-muted"
                  }`}
                >
                  {birthday || "Select your birthday"}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.muted.DEFAULT}
                />
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onBirthdayChange}
                  maximumDate={new Date()} // Can't select future dates
                  minimumDate={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 100),
                    )
                  } // Can't select dates more than 100 years ago
                />
              )}
              {errors.birthday && (
                <Text className="text-sm text-danger mt-1">
                  {errors.birthday}
                </Text>
              )}
            </View>

            {/* Gender */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-foreground mb-2">
                Gender
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {genderOptions.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setGender(option)}
                    className={`px-4 py-2 rounded-full border ${
                      gender === option
                        ? "bg-primary border-primary"
                        : "bg-white border-border"
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        gender === option ? "text-white" : "text-foreground"
                      }`}
                    >
                      {option?.charAt(0)! + option?.slice(1).toLowerCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errors.gender && (
                <Text className="text-sm text-danger mt-1">
                  {errors.gender}
                </Text>
              )}
            </View>

            {/* Location */}
            <LocationPicker
              mode="city"
              onChange={handleLocationChange}
              placeholder={location ? location.formatted : undefined}
              error={errors.location}
            />

            {/* Bio (Optional) */}
            <FormField
              label="Bio (Optional)"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people a bit about yourself..."
              multiline
              numberOfLines={4}
              containerClassName="mb-8"
              style={{ minHeight: 100 }}
            />

            {/* Terms and Conditions Checkbox */}
            <View className="flex-row items-center mb-6 px-1">
              <Pressable
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-6 h-6 rounded border items-center justify-center mr-3 ${
                  agreedToTerms
                    ? "bg-primary border-primary"
                    : "border-border bg-white"
                }`}
              >
                {agreedToTerms && (
                  <Ionicons name="checkmark" size={18} color="white" />
                )}
              </Pressable>
              <View className="flex-1 flex-row flex-wrap">
                <Text className="text-sm text-muted">I agree to Grouply's </Text>
                <Text
                  className="text-sm text-primary font-semibold underline"
                  onPress={() =>
                    Linking.openURL(
                      "https://grouply.carrd.co/#termsandconditions",
                    )
                  }
                >
                  Terms & Conditions
                </Text>
              </View>
            </View>

            {/* Save and Continue Button */}
            <View className="mb-8">
              <GrouplyButton
                label={isSubmitting ? "Creating Profile..." : "Save & Continue"}
                variant="primary"
                size="large"
                fullWidth
                onPress={handleSaveAndContinue}
                disabled={
                  !givenName ||
                  !birthday ||
                  !gender ||
                  !location ||
                  !agreedToTerms ||
                  isSubmitting
                }
                isLoading={isSubmitting}
              />
            </View>
          </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AboutYouSetup;
