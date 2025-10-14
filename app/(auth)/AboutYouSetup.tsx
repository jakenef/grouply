import CoarseLocationPicker, {
  LocationData,
} from "@/components/CoarseLocationPicker";
import FormField from "@/components/FormField";
import ProfileImagePicker from "@/components/ProfileImagePicker";
import { useAuth } from "@/lib/auth";
import uploadImageUri from "@/lib/storage";
import { colors } from "@/lib/theme";
import { trpc } from "@/lib/trpc";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GrouplyButton from "../../components/GrouplyButton";

type Gender = "Male" | "Female" | "Other" | null;

const AboutYouSetup = () => {
  const { user, session } = useAuth(); // Get authentication context
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState<Gender>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        ]
      );
    }
  }, [session]);

  // Set up tRPC mutation
  const createUserMutation = trpc.users.createUserAndUserProfile.useMutation();

  const onBirthdayChange = (event: any, selectedDate?: Date) => {
    // If user canceled the picker on iOS
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    // If a date was selected
    if (selectedDate) {
      const currentDate = selectedDate;
      setDate(currentDate);

      // Format the selected date for display
      const formattedDate = format(currentDate, "MMMM d, yyyy");
      setBirthday(formattedDate);

      // For Android, the picker is modal and closes automatically
      // For iOS, we'll keep the picker open so they can continue adjusting if desired
    }
  };

  const toggleDatePicker = () => {
    setShowDatePicker((prevState) => !prevState);
  };

  const handleLocationChange = (locationData: LocationData | null) => {
    if (locationData) {
      // Set the formatted location name to the state
      setLocation(locationData);
      console.log("Selected location:", locationData);
    } else {
      // Clear the location if null is passed
      setLocation(null);
      console.log("Location cleared or not selected");
    }
  };

  const validateForm = () => {
    const newErrors: {
      displayName?: string;
      birthday?: string;
      gender?: string;
      location?: string;
    } = {};

    if (!displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    if (!birthday) {
      newErrors.birthday = "Birthday is required";
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
    if (!session || !user) {
      Alert.alert(
        "Authentication Required",
        "You must be logged in to complete your profile.",
        [
          {
            text: "Go to Login",
            onPress: () => router.replace("/(auth)/LandingPage"),
          },
        ]
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
            userId: user?.id,
            maxSizeBytes: 1.5 * 1024 * 1024,
          });
          avatarUrlToSend = publicUrl;
        } catch (err: any) {
          console.error("Error uploading avatar:", err);
          Alert.alert(
            "Upload error",
            err?.message || "Failed to upload avatar. Please try again."
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Call the mutation with the form data (include avatarUrl if present)
      await createUserMutation.mutateAsync({
        displayName,
        birthday: date, // Send the actual Date object, not the formatted string
        gender: gender as "Male" | "Female" | "Other", // Type assertion since we validated gender is not null
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
          ]
        );
      } else {
        // Generic error
        Alert.alert(
          "Error",
          error.message || "Failed to create your profile. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const genderOptions: Gender[] = ["Male", "Female", "Other"];

  // Handle outside touch to dismiss date picker
  const handleOutsideTouch = () => {
    if (showDatePicker) {
      setShowDatePicker(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TouchableWithoutFeedback onPress={handleOutsideTouch}>
        <ScrollView
          className="flex-1 px-8"
          showsVerticalScrollIndicator={false}
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

          {/* Display Name */}
          <FormField
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="What should people call you?"
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
                    new Date().setFullYear(new Date().getFullYear() - 100)
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
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.gender && (
              <Text className="text-sm text-danger mt-1">{errors.gender}</Text>
            )}
          </View>

          {/* Location */}
          <CoarseLocationPicker
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

          {/* Save and Continue Button */}
          <View className="mb-8">
            <GrouplyButton
              label={isSubmitting ? "Creating Profile..." : "Save & Continue"}
              variant="primary"
              size="large"
              fullWidth
              onPress={handleSaveAndContinue}
              disabled={
                !displayName ||
                !birthday ||
                !gender ||
                !location ||
                isSubmitting
              }
              isLoading={isSubmitting}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default AboutYouSetup;
