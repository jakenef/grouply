import { DateTimePicker } from "@/app-components/shared/DateTimePicker";
import { FormField } from "@/app-components/shared/FormField";
import GrouplyButton from "@/app-components/shared/GrouplyButton";
import {
  LocationData,
  LocationPicker,
} from "@/app-components/shared/LocationPicker";
import uploadImageUri from "@/lib/storage";
import { trpc } from "@/lib/trpc";
import { useCurrentUser } from "@/lib/useCurrentUserHook";
import calculateAge from "@/shared/utils/calculateAge";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ActivityPicker } from "../shared/ActivityPicker";
import UploadMultiplePictures from "../shared/UploadMultiplePictures";

function validateEventForm({
  name,
  description,
  activityId,
  location,
  startTime,
  endTime,
  maxAttendees,
  minAttendees,
  minAge,
  maxAge,
  imgUrls,
  userAge,
  currentAttendees,
}: {
  name: string;
  description: string;
  activityId: string | null;
  location: LocationData | null;
  startTime: Date;
  endTime: Date;
  maxAttendees: string;
  minAttendees: string;
  minAge: string;
  maxAge: string;
  imgUrls?: string[];
  userAge: number | null;
  currentAttendees?: number;
}) {
  const errors: Record<string, string> = {};

  if (!name.trim()) errors.name = "Event name is required";
  if (!description.trim()) errors.description = "Description is required";
  if (!activityId) errors.activityId = "Activity is required";
  if (!location) errors.location = "Location is required";
  if (!imgUrls || imgUrls.length === 0)
    errors.imgUrls = "At least one image is required";

  if (!maxAttendees || isNaN(Number(maxAttendees)) || Number(maxAttendees) <= 0)
    errors.maxAttendees = "Must be a positive number";
  if (!minAttendees || isNaN(Number(minAttendees)) || Number(minAttendees) <= 0)
    errors.minAttendees = "Must be a positive number";

  // Validate min <= max attendees
  if (
    minAttendees &&
    maxAttendees &&
    Number(minAttendees) > Number(maxAttendees)
  )
    errors.attendeeRange = "Min attendees cannot be greater than max attendees";

  // Validate against current attendees if provided
  if (currentAttendees !== undefined) {
    if (maxAttendees && Number(maxAttendees) < currentAttendees)
      errors.maxAttendees = `Cannot be less than current attendees (${currentAttendees})`;
  }

  if (!minAge || isNaN(Number(minAge)) || Number(minAge) <= 0)
    errors.minAge = "Must be a positive number";
  if (!maxAge || isNaN(Number(maxAge)) || Number(maxAge) <= 0)
    errors.maxAge = "Must be a positive number";

  if (minAge && maxAge && Number(minAge) > Number(maxAge))
    errors.ageRange = "Min age cannot be greater than max age";

  // Validate creator's age is within range
  if (userAge !== null && minAge && maxAge) {
    if (userAge < Number(minAge) || userAge > Number(maxAge)) {
      errors.ageRange = `Your age (${userAge}) is outside the event's age range (${minAge}-${maxAge})`;
    }
  }

  // Validate start time is not in the past
  const now = new Date();
  if (startTime < now) {
    errors.startTime = "Event start time cannot be in the past";
  }

  // Validate end time is after start time
  if (startTime && endTime && endTime <= startTime) {
    errors.timeRange = "Event end time must be after start time";
  }

  return errors;
}

interface EventDetailsFormProps {
  event?: EventDetails;
}

interface EventDetails {
  id?: string;
  name: string;
  description: string;
  minAge: number;
  maxAge: number;
  maxAttendees: number;
  minAttendees: number;
  currentAttendees?: number;
  startTime: Date;
  endTime: Date;
  activityId: string | null;
  imgUrls?: string[];
  locationId?: string;
}

export const EventDetailsForm = (props: EventDetailsFormProps) => {
  const { user } = useCurrentUser();
  const utils = trpc.useUtils();
  const upsertEventMutation = trpc.events.upsertEvent.useMutation({
    onSuccess: () =>
      utils.events.getEventDetailsFromId.invalidate({ id: props.event?.id }),
  });
  const [name, setName] = useState(props.event?.name || "");
  const [description, setDescription] = useState(
    props.event?.description || ""
  );
  const [activityId, setActivityId] = useState<string | null>(
    props.event?.activityId || null
  );

  const [location, setLocation] = useState<LocationData | null>(null);

  // Fetch location data if locationId is provided
  const { data: locationData } = trpc.locations.getLocationById.useQuery(
    { id: props.event?.locationId! },
    { enabled: !!props.event?.locationId }
  );

  // Set location when locationData is fetched
  React.useEffect(() => {
    if (locationData) {
      setLocation(locationData);
    }
  }, [locationData]);

  const [startTime, setStartTime] = useState(
    props.event?.startTime || new Date()
  );
  const [endTime, setEndTime] = useState(props.event?.endTime || new Date());
  const [maxAttendees, setMaxAttendees] = useState(
    props.event?.maxAttendees?.toString() || ""
  );
  const [minAttendees, setMinAttendees] = useState(
    props.event?.minAttendees?.toString() || ""
  );
  const [minAge, setMinAge] = useState(props.event?.minAge?.toString() || "");
  const [maxAge, setMaxAge] = useState(props.event?.maxAge?.toString() || "");

  const [imgUrls, setImgUrls] = useState(props.event?.imgUrls);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    const userAge = calculateAge(new Date(user?.birthday!));
    const validationErrors = validateEventForm({
      name,
      description,
      activityId,
      location,
      startTime,
      endTime,
      maxAttendees,
      minAttendees,
      minAge,
      maxAge,
      imgUrls,
      userAge,
      currentAttendees: props.event?.currentAttendees,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert(
        "Validation Error",
        "Please fill out all required fields correctly."
      );
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // Upload all images
      const uploadedUrls = await Promise.all(
        imgUrls!.map((uri) =>
          uploadImageUri(uri, {
            bucket: "event-images",
            maxSizeBytes: 3 * 1024 * 1024,
          })
        )
      );

      // Use first image as cover
      const coverImageUrl = uploadedUrls[0];

      // Call upsert mutation
      await upsertEventMutation.mutateAsync({
        eventId: props.event?.id,
        name,
        description,
        activityId: activityId!,
        startTime,
        endTime,
        locationData: location!,
        imageUrls: uploadedUrls.map((uploadedObj) => uploadedObj.publicUrl),
        coverImageUrl: coverImageUrl.publicUrl,
        maxAttendees: Number(maxAttendees),
        minAttendees: Number(minAttendees),
        minAge: Number(minAge),
        maxAge: Number(maxAge),
      });

      // Success! Navigate back
      Alert.alert(
        "Success",
        props.event?.id
          ? "Event updated successfully"
          : "Event created successfully"
      );
      router.back();
    } catch (error) {
      console.error("Error saving event:", error);
      Alert.alert("Error", "Failed to save event. Please try again.");
      setIsLoading(false);
    }
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
            error={errors.name}
          />

          <UploadMultiplePictures onChange={setImgUrls} value={imgUrls ?? []} />
          {errors.imgUrls && (
            <Text className="text-danger text-sm mt-1 mb-4">
              {errors.imgUrls}
            </Text>
          )}

          <FormField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Tell people about your event..."
            multiline
            numberOfLines={4}
            containerClassName="my-6"
            error={errors.description}
          />

          <ActivityPicker onChange={setActivityId} value={activityId} />
          {errors.activityId && (
            <Text className="text-danger text-sm mt-1 mb-4">
              {errors.activityId}
            </Text>
          )}

          <LocationPicker
            mode="venue"
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="Search for a location..."
          />
          {errors.location && (
            <Text className="text-danger text-sm mt-1 mb-4">
              {errors.location}
            </Text>
          )}

          <DateTimePicker
            label="Start Time"
            value={startTime}
            onChange={setStartTime}
          />
          {errors.startTime && (
            <Text className="text-danger text-sm mt-1 mb-4">
              {errors.startTime}
            </Text>
          )}

          <DateTimePicker
            label="End Time"
            value={endTime}
            onChange={setEndTime}
          />
          {errors.timeRange && (
            <Text className="text-danger text-sm mt-1 mb-4">
              {errors.timeRange}
            </Text>
          )}

          <View className="flex-row gap-4 mb-6">
            <View className="flex-1">
              <FormField
                label="Min Attendees"
                value={minAttendees}
                onChangeText={setMinAttendees}
                placeholder="e.g. 4"
                keyboardType="numeric"
                containerClassName="mb-0"
                error={errors.minAttendees}
              />
            </View>
            <View className="flex-1">
              <FormField
                label="Max Attendees"
                value={maxAttendees}
                onChangeText={setMaxAttendees}
                placeholder="e.g. 10"
                keyboardType="numeric"
                containerClassName="mb-0"
                error={errors.maxAttendees}
              />
            </View>
          </View>
          {errors.attendeeRange && (
            <Text className="text-danger text-sm -mt-4 mb-4">
              {errors.attendeeRange}
            </Text>
          )}

          <View className="flex-row gap-4 mb-6">
            <View className="flex-1">
              <FormField
                label="Min Age"
                value={minAge}
                onChangeText={setMinAge}
                placeholder="18"
                keyboardType="numeric"
                containerClassName="mb-0"
                error={errors.minAge}
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
                error={errors.maxAge}
              />
            </View>
          </View>
          {errors.ageRange && (
            <Text className="text-danger text-sm -mt-4 mb-4">
              {errors.ageRange}
            </Text>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-4 mb-8">
            <View className="flex-1">
              <GrouplyButton
                label="Cancel"
                variant="outline"
                onPress={handleCancel}
                fullWidth
                disabled={isLoading}
              />
            </View>
            <View className="flex-1">
              <GrouplyButton
                label={
                  isLoading
                    ? "Loading..."
                    : props.event?.id
                    ? "Save Event"
                    : "Create and Host Event"
                }
                variant="primary"
                onPress={handleSave}
                fullWidth
                disabled={isLoading}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
