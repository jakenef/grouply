import { colors, textInputStyles } from "@/lib/theme";
import { trpc } from "@/lib/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Activity {
  id: string;
  label: string;
  description: string | null;
}

interface ActivityPickerProps {
  value?: string | null;
  onChange: (activityId: string | null) => void;
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const ActivityPicker = ({
  value,
  onChange,
  label = "Activity",
  error,
  containerClassName = "mb-6",
}: ActivityPickerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch selected activity details if value is provided
  const { data: selectedActivity, isLoading: isLoadingSelected } =
    trpc.activities.getById.useQuery(
      { id: value! },
      { enabled: !!value && value.length > 0 }
    );

  // Fetch activities based on search term
  const {
    data: activities = [],
    isLoading: isSearchingActivities,
    error: searchError,
  } = trpc.activities.search.useQuery(
    { query: searchTerm },
    { enabled: searchTerm.length > 1 }
  );

  console.log("ActivityPicker state:", {
    searchTerm,
    searchTermLength: searchTerm.length,
    isSearching,
    isSearchingActivities,
    activitiesCount: activities.length,
    activities,
    searchError: searchError?.message,
  });

  const handleSelectActivity = (activity: Activity) => {
    onChange(activity.id);
    setSearchTerm("");
    setIsSearching(false);
  };

  const handleClearSelection = () => {
    onChange(null);
    setSearchTerm("");
  };

  return (
    <View className={containerClassName}>
      <Text className="text-base font-semibold text-foreground mb-2">
        {label}
      </Text>

      {/* Selected Activity Display */}
      {selectedActivity && !isSearching && (
        <View className="flex-row items-center justify-between px-4 py-3 border border-border rounded-xl bg-white mb-2">
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">
              {selectedActivity.label}
            </Text>
            {selectedActivity.description && (
              <Text className="text-sm text-muted mt-1" numberOfLines={2}>
                {selectedActivity.description}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleClearSelection}
            className="ml-2 p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-circle"
              size={24}
              color={colors.muted.DEFAULT}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Search Input */}
      {(!selectedActivity || isSearching) && (
        <View>
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search activities..."
            onFocus={() => setIsSearching(true)}
            placeholderTextColor={colors.muted.DEFAULT}
            style={[
              textInputStyles.standard,
              error ? textInputStyles.error : null,
            ]}
          />

          {error && <Text className="text-sm text-danger mt-1">{error}</Text>}

          {/* Search Results */}
          {searchTerm.length > 1 && (
            <View className="border border-border rounded-xl bg-white max-h-60">
              {isSearchingActivities ? (
                <View className="p-4 items-center">
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : activities.length > 0 ? (
                <FlatList
                  data={activities}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleSelectActivity(item)}
                      className="px-4 py-3 border-b border-border"
                    >
                      <Text className="text-base font-semibold text-foreground">
                        {item.label}
                      </Text>
                      {item.description && (
                        <Text
                          className="text-sm text-muted mt-1"
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View className="p-4">
                  <Text className="text-muted text-center">
                    No activities found
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Change Activity Button */}
          {selectedActivity && isSearching && (
            <TouchableOpacity
              onPress={() => {
                setIsSearching(false);
                setSearchTerm("");
              }}
              className="mt-2"
            >
              <Text className="text-primary text-center">Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Change Activity Button (when activity is selected) */}
      {selectedActivity && !isSearching && (
        <TouchableOpacity onPress={() => setIsSearching(true)} className="mt-2">
          <Text className="text-primary text-center">Change Activity</Text>
        </TouchableOpacity>
      )}

      {error && <Text className="text-sm text-danger mt-1">{error}</Text>}
    </View>
  );
};
