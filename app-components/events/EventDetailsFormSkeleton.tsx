import { Skeleton } from "moti/skeleton";
import { ScrollView, View } from "react-native";

export function EventDetailsFormSkeleton() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Title */}
        <Skeleton colorMode="light" width={180} height={32} radius={8} />

        {/* Event Name Field */}
        <View className="mt-6">
          <Skeleton colorMode="light" width={100} height={16} radius={4} />
          <View className="mt-2">
            <Skeleton colorMode="light" width="100%" height={48} radius={8} />
          </View>
        </View>

        {/* Image Upload Area */}
        <View className="mt-6">
          <Skeleton colorMode="light" width="100%" height={200} radius={12} />
        </View>

        {/* Description Field */}
        <View className="mt-6">
          <Skeleton colorMode="light" width={100} height={16} radius={4} />
          <View className="mt-2">
            <Skeleton colorMode="light" width="100%" height={120} radius={8} />
          </View>
        </View>

        {/* Activity Picker */}
        <View className="mt-6">
          <Skeleton colorMode="light" width={80} height={16} radius={4} />
          <View className="mt-2">
            <Skeleton colorMode="light" width="100%" height={48} radius={8} />
          </View>
        </View>

        {/* Location Picker */}
        <View className="mt-6">
          <Skeleton colorMode="light" width={80} height={16} radius={4} />
          <View className="mt-2">
            <Skeleton colorMode="light" width="100%" height={48} radius={8} />
          </View>
        </View>

        {/* Start Time */}
        <View className="mt-6">
          <Skeleton colorMode="light" width={100} height={16} radius={4} />
          <View className="mt-2">
            <Skeleton colorMode="light" width="100%" height={48} radius={8} />
          </View>
        </View>

        {/* End Time */}
        <View className="mt-6">
          <Skeleton colorMode="light" width={100} height={16} radius={4} />
          <View className="mt-2">
            <Skeleton colorMode="light" width="100%" height={48} radius={8} />
          </View>
        </View>

        {/* Max Attendees */}
        <View className="mt-6">
          <Skeleton colorMode="light" width={180} height={16} radius={4} />
          <View className="mt-2">
            <Skeleton colorMode="light" width="100%" height={48} radius={8} />
          </View>
        </View>

        {/* Min/Max Age */}
        <View className="flex-row gap-4 mt-6">
          <View className="flex-1">
            <Skeleton colorMode="light" width={60} height={16} radius={4} />
            <View className="mt-2">
              <Skeleton colorMode="light" width="100%" height={48} radius={8} />
            </View>
          </View>
          <View className="flex-1">
            <Skeleton colorMode="light" width={60} height={16} radius={4} />
            <View className="mt-2">
              <Skeleton colorMode="light" width="100%" height={48} radius={8} />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mt-8 mb-8">
          <View className="flex-1">
            <Skeleton colorMode="light" width="100%" height={50} radius={8} />
          </View>
          <View className="flex-1">
            <Skeleton colorMode="light" width="100%" height={50} radius={8} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
