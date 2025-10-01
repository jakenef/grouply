import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
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

  const handleAvatarPress = () => {
    // TODO: Implement image picker
    console.log("Avatar picker would open here");
  };

  const handleLocationPress = () => {
    // TODO: Implement location picker/search
    console.log("Location picker would open here");
  };

  const handleBirthdayPress = () => {
    // TODO: Implement date picker
    console.log("Date picker would open here");
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
          <Pressable
            onPress={handleAvatarPress}
            className="w-32 h-32 rounded-full bg-muted items-center justify-center border-2 border-dashed border-muted-darker"
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                className="w-full h-full rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Ionicons name="camera" size={32} color="#9CA3AF" />
                <Text className="text-xs text-muted-darker mt-1">
                  Add Photo
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Display Name */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-foreground mb-2">
            Display Name *
          </Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="What should people call you?"
            className="bg-white border border-border rounded-xl px-4 py-3 text-base text-foreground"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Birthday */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-foreground mb-2">
            Birthday *
          </Text>
          <Pressable
            onPress={handleBirthdayPress}
            className="bg-white border border-border rounded-xl px-4 py-3 flex-row items-center justify-between"
          >
            <Text
              className={`text-base ${
                birthday ? "text-foreground" : "text-muted"
              }`}
            >
              {birthday || "Select your birthday"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Gender */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-foreground mb-2">
            Gender *
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
            Location *
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
            <Ionicons name="location-outline" size={20} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Bio (Optional) */}
        <View className="mb-8">
          <Text className="text-base font-semibold text-foreground mb-2">
            Bio (Optional)
          </Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people a bit about yourself..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-white border border-border rounded-xl px-4 py-3 text-base text-foreground min-h-[100px]"
            placeholderTextColor="#9CA3AF"
          />
        </View>

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
