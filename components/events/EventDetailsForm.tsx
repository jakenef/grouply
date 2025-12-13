import {
  CoarseLocationPicker,
  LocationData,
} from "@/components/shared/CoarseLocationPicker";
import { DateTimePicker } from "@/components/shared/DateTimePicker";
import { FormField } from "@/components/shared/FormField";
import GrouplyButton from "@/components/shared/GrouplyButton";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ActivityPicker } from "../shared/ActivityPicker";

interface EventDetailsFormProps {
  event?: EventDetails;
}

interface EventDetails {
  name: string;
  description: string;
  minAge: number;
  maxAge: number;
  maxAttendees: number;
  startTime: Date;
  endTime: Date;
  activityId: string | null;
}

export const EventDetailsForm = (props: EventDetailsFormProps) => {
  const [name, setName] = useState(props.event?.name || "");
  const [description, setDescription] = useState(
    props.event?.description || ""
  );
  const [activityId, setActivityId] = useState<string | null>(
    props.event?.activityId || null
  );

  const [location, setLocation] = useState<LocationData | null>(null);
  const [startTime, setStartTime] = useState(
    props.event?.startTime || new Date()
  );
  const [endTime, setEndTime] = useState(props.event?.endTime || new Date());
  const [maxAttendees, setMaxAttendees] = useState(
    props.event?.maxAttendees?.toString() || ""
  );
  const [minAge, setMinAge] = useState(props.event?.minAge?.toString() || "");
  const [maxAge, setMaxAge] = useState(props.event?.maxAge?.toString() || "");

  const handleSave = () => {
    // TODO: Hook up to backend
    console.log("Save event:", {
      name,
      description,
      activityId,
      location,
      startTime,
      endTime,
      maxAttendees,
      minAge,
      maxAge,
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="p-4">
          <Text className="text-2xl font-bold text-foreground mb-6">
            {props.event ? "Edit Event" : "Create Event"}
          </Text>

          <FormField
            label="Event Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Board Game Night"
          />

          <FormField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Tell people about your event..."
            multiline
            numberOfLines={4}
          />

          <ActivityPicker onChange={setActivityId} value={activityId} />

          <CoarseLocationPicker
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="Search for a location..."
          />

          <DateTimePicker
            label="Start Time"
            value={startTime}
            onChange={setStartTime}
          />

          <DateTimePicker
            label="End Time"
            value={endTime}
            onChange={setEndTime}
          />

          <FormField
            label="Max Attendees"
            value={maxAttendees}
            onChangeText={setMaxAttendees}
            placeholder="e.g. 10"
            keyboardType="numeric"
          />

          <View className="flex-row gap-4 mb-6">
            <View className="flex-1">
              <FormField
                label="Min Age"
                value={minAge}
                onChangeText={setMinAge}
                placeholder="18"
                keyboardType="numeric"
                containerClassName="mb-0"
              />
            </View>
            <View className="flex-1">
              <FormField
                label="Max Age"
                value={maxAge}
                onChangeText={setMaxAge}
                placeholder="35"
                keyboardType="numeric"
                containerClassName="mb-0"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-4 mb-8">
            <View className="flex-1">
              <GrouplyButton
                label="Cancel"
                variant="outline"
                onPress={handleCancel}
                fullWidth
              />
            </View>
            <View className="flex-1">
              <GrouplyButton
                label="Save Event"
                variant="primary"
                onPress={handleSave}
                fullWidth
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
