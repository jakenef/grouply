import { EventDetailsForm } from "@/app-components/events/EventDetailsForm";
import { EventDetailsFormSkeleton } from "@/app-components/events/EventDetailsFormSkeleton";
import { trpc } from "@/lib/trpc";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function EventDetailsEdit() {
  const { channelId, existingEventId } = useLocalSearchParams<{
    channelId?: string;
    existingEventId?: string;
  }>();

  // Fetch existing event if existingEventId is provided
  const {
    data: existingEvent,
    isLoading: isLoadingExisting,
    error: existingError,
  } = trpc.events.getEventDetailsFromId.useQuery(
    { id: existingEventId! },
    { enabled: !!existingEventId && existingEventId.length > 0 }
  );

  // Generate event from channel if existingEventId is not provided
  const {
    data: generatedEventFields,
    isLoading: isLoadingGenerated,
    error: generatedError,
  } = trpc.events.generateEventFromChannel.useQuery(
    { channelId: channelId! },
    { enabled: !existingEventId && !!channelId && channelId.length > 0 }
  );

  const isLoading = isLoadingExisting || isLoadingGenerated;
  const error = existingError || generatedError;

  if (isLoading) {
    return (
      <View className="flex-1">
        <EventDetailsFormSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1">
        <Text>Error loading event edit page. {error.message}</Text>
      </View>
    );
  }

  // Use existing event if available, otherwise use generated fields
  const eventFields = existingEvent || generatedEventFields;

  const convertedEventFields = eventFields
    ? {
        ...eventFields,
        id: existingEvent?.id, // Only include id if editing existing event
        minAttendees: eventFields.minAttendees ?? 1, // Default to 1 if not set
        startTime: new Date(eventFields.startTime),
        endTime: new Date(eventFields.endTime),
        isCanceled: existingEvent?.isCanceled ?? false, // Only from existing events
        currentAttendees: existingEvent?.attendeeIds?.length, // Only populate for existing events
        coverImageUrl: existingEvent?.coverImageUrl ?? "",
        additionalImageUrls: existingEvent?.additionalImageUrls,
      }
    : undefined;

  return <EventDetailsForm event={convertedEventFields} />;
}
