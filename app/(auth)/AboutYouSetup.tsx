import FormField from "@/components/FormField";
import ProfileImagePicker from "@/components/ProfileImagePicker";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GrouplyButton from "../../components/GrouplyButton";

type Gender = "Male" | "Female" | "Other" | null;

const AboutYouSetup = () => {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState<Gender>(null);
  const [location, setLocation] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());

  const onBirthdayChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);

    if (selectedDate) {
      // Format the selected date for display
      const formattedDate = format(currentDate, "MMMM d, yyyy");
      setBirthday(formattedDate);
    }
  };

  const handleLocationPress = () => {
    // TODO: Implement location picker/search
    console.log("Location picker would open here");
  };

  const handleSaveAndContinue = () => {
    // TODO: Implement tRPC mutation to save user data
    console.log("Saving user data:", {
      displayName,
      bio,
      birthday,
      gender,
      location,
      avatarUri,
    });

    // Navigate to preferences setup
    router.push("/(auth)/PreferencesSetup");
  };

  const genderOptions: Gender[] = ["Male", "Female", "Other"];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
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
        />

        {/* Birthday */}
        <View className="mb-6 flex-col">
          <Text className="text-base font-semibold text-foreground mb-2">
            Birthday
          </Text>
          <Pressable className="bg-white border border-border rounded-xl px-4 py-3 flex-row items-center justify-between">
            <View className="items-center">
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
            </View>
          </Pressable>
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
        </View>

        {/* Location */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-foreground mb-2">
            Location
          </Text>
          <Pressable
            onPress={handleLocationPress}
            className="bg-white border border-border rounded-xl px-4 py-3 flex-row items-center justify-between"
          >
            <Text
              className={`text-base ${
                location ? "text-foreground" : "text-muted"
              }`}
            >
              {location || "Add your city"}
            </Text>
            <Ionicons
              name="location-outline"
              size={20}
              color={colors.muted.DEFAULT}
            />
          </Pressable>
        </View>

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
            label="Save & Continue"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSaveAndContinue}
            disabled={!displayName || !birthday || !gender || !location}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutYouSetup;
