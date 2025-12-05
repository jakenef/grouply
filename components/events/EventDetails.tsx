import { colors } from "@/lib/theme";
import { useCurrentUser } from "@/lib/useCurrentUserHook";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import GrouplyButton from "../shared/GrouplyButton";
import ImageCarousel from "../shared/ImageCarousel";
import ProfilePictureGroup from "../users/ProfilePictureGroup";

interface EventDetailsObject {
  description: string;
  maxAttendees: number;
  id: string;
  minAge: number;
  maxAge: number;
  name: string;
  locationId: string;
  startTime: string;
  endTime: string;
  numRegistered: number;
  attendeeIds: string[];
  imageUrls: string[];
}

interface EventDetailsProps {
  event: EventDetailsObject;
}

export default function EventDetails(props: EventDetailsProps) {
  const { user } = useCurrentUser();
  const formattedStart = format(
    props.event.startTime,
    "eeee, MMMM d, yyyy • h:mm a - "
  );
  const formattedEndTime = format(props.event.endTime, "h:mm a");
  const fractionAttendees =
    props.event.numRegistered / props.event.maxAttendees;
  //TODO: make edit button for event host and join event / backout switch based on attendance status
  const isUserAttending = user && user.id in props.event.attendeeIds;
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-3 bg-background">
        <Ionicons
          name="arrow-back-circle-outline"
          size={30}
          onPress={() => router.back()}
        />
        <Ionicons name="share-outline" size={30} />
      </View>

      {/* Content */}
      <ScrollView className="flex-1">
        <View className="p-4 pt-1">
          <Text className="text-3xl font-bold">{props.event.name}</Text>
          <View className="flex-row items-center pt-2 pb-1">
            <Ionicons
              name="calendar"
              color={colors.primary}
              size={15}
              className="pr-2"
            />
            <Text className="text-lg text-muted">
              {formattedStart + formattedEndTime}
            </Text>
          </View>
          <View className="flex-row items-center pb-2">
            <Ionicons
              name="location"
              color={colors.primary}
              size={15}
              className="pr-2"
            />
            <Text className="text-lg text-muted">Santa Monica</Text>
          </View>

          {/* Pictures */}
          <ImageCarousel imageUrls={props.event.imageUrls} />

          {/* More details */}
          <Text className="text-xl font-bold pt-3">About this event</Text>
          <Text className="text-lg text-muted py-5">
            {props.event.description}
          </Text>
          <View className="bg-gray-100 rounded-md p-3 flex-row items-center">
            <Ionicons name="people" size={25} color={colors.primary} />
            <View className="flex-col items-start pl-3">
              <Text className="mb-2">
                {props.event.numRegistered} of {props.event.maxAttendees} spots
                filled
              </Text>
              <View className="h-2 w-full bg-gray-300 rounded">
                <View
                  className="h-2 bg-primary rounded"
                  style={{ width: `${fractionAttendees * 100}%` }}
                />
              </View>
            </View>
          </View>
          <View className="flex-row items-center">
            <Ionicons
              name="calendar-number"
              color={colors.primary}
              size={15}
              className="pr-2"
            />
            <Text className="text-lg text-muted">
              Age range: {props.event.minAge} - {props.event.maxAge}
            </Text>
          </View>

          {/* Buttons: if current user is registered for this event, show back out button instead */}
          {isUserAttending ? (
            <GrouplyButton
              label="Back Out"
              style={{ backgroundColor: colors.muted.DEFAULT }}
            />
          ) : (
            <GrouplyButton
              label="Join Event"
              iconName="checkmark-circle"
              iconPosition="left"
            />
          )}

          <View className="flex-row items-center justify-between py-3 gap-3">
            <Pressable className="flex-1 border border-gray-200 rounded-xl p-3">
              <View className="flex-row items-center">
                <Ionicons
                  name="calendar-outline"
                  color={colors.primary}
                  className="pr-2"
                />
                <Text>Add to Calendar</Text>
              </View>
            </Pressable>
            <Pressable className="flex-1 border border-gray-200 rounded-xl p-3">
              <View className="flex-row items-center">
                <Ionicons
                  name="chatbubble-outline"
                  color={colors.primary}
                  className="pr-2"
                />
                <Text>Message Host</Text>
              </View>
            </Pressable>
          </View>

          {/* Attendees */}
          <View className="flex-row justify-between">
            <Text className="text-xl font-bold">Attendees</Text>
            {props.event.attendeeIds && (
              <Pressable>
                <Text className="text-lg text-info">See all</Text>
              </Pressable>
            )}
          </View>
          <ProfilePictureGroup userIds={props.event.attendeeIds} />
        </View>
      </ScrollView>
    </View>
  );
}
