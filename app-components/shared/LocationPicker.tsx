import { requestForegroundLocationPermission } from "@/lib/permissions";
import { colors, textInputStyles } from "@/lib/theme";
import { trpc } from "@/lib/trpc";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

interface LocationResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface LocationData {
  placeId: string;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  countryCode?: string | null;
  lat: number | null;
  lng: number | null;
  formatted: string;
  name?: string | null;
}

// Helper to normalize location data - handles both LocationData and Prisma Location types
function normalizeLocationData(
  location: LocationData | null | undefined
): LocationData | null {
  if (!location) return null;

  // If location has 'id' instead of 'placeId' (from Prisma), map it
  const normalized = location as any;
  return {
    placeId: normalized.placeId || normalized.id,
    city: location.city,
    region: location.region,
    country: location.country,
    countryCode: location.countryCode,
    lat: location.lat,
    lng: location.lng,
    formatted: location.formatted || "",
    name: location.name,
  };
}

interface LocationPickerProps {
  /**
   * Search mode - 'city' for broad locations, 'venue' for specific places
   */
  mode?: "city" | "venue";

  /**
   * Label text to display above the input
   */
  label?: string;

  /**
   * Optional error message to display
   */
  error?: string;

  /**
   * Optional helper text to display below the input
   */
  helperText?: string;

  /**
   * Custom styling for the label text
   */
  labelStyle?: object;

  /**
   * Custom className for the label text
   */
  labelClassName?: string;

  /**
   * Custom className for the container
   */
  containerClassName?: string;

  /**
   * Placeholder text for the search input
   */
  placeholder?: string;

  /**
   * Current location value
   */
  value?: LocationData | null;

  /**
   * Called when location is selected
   */
  onChange: (location: LocationData | null) => void;

  /**
   * Called when there's an error
   */
  onError?: (error: Error) => void;
}

/**
 * A unified component for selecting locations - supports both city-level and venue-level searches
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({
  mode = "city",
  label = "Location",
  error,
  helperText,
  labelStyle,
  labelClassName = "text-base font-semibold text-foreground mb-2",
  containerClassName = "mb-6",
  placeholder,
  value,
  onChange,
  onError,
}) => {
  // Normalize the incoming value to handle both LocationData and Prisma Location types
  const normalizedValue = normalizeLocationData(value);

  // Set default placeholder based on mode
  const effectivePlaceholder =
    placeholder ||
    (mode === "city" ? "Search for a city" : "Search for a venue");

  // Enable LayoutAnimation for Android
  if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const searchInputRef = useRef<TextInput>(null);

  // Animation values
  const expandAnimation = useRef(new Animated.Value(0)).current;

  // Create tRPC query client
  const utils = trpc.useContext();

  // Debounced search implementation without external library
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedSearch = (query: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.length < 2) {
      setLocationResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimeout.current = setTimeout(async () => {
      try {
        // Using the direct client to query the endpoint
        const results = await utils.client.locations.searchLocations.query({
          query,
          precision: mode,
        });
        setLocationResults(results || []);
      } catch (error) {
        // Handle error gracefully - set empty results instead of showing error
        console.error("Error searching locations:", error);
        setLocationResults([]);
        // Only call onError if it's a critical error, not just "no results"
        if (onError && !(error as any)?.message?.includes("NOT_FOUND")) {
          onError(error as Error);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // Reset search and set up animation when component expands
  useEffect(() => {
    // Set animation value when expanded changes
    Animated.timing(expandAnimation, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.ease),
    }).start();

    if (expanded) {
      setSearchQuery("");
      setLocationResults([]);
      // Focus the search input when expanded
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 200); // Wait for animation to complete
    }
  }, [expanded]);

  const toggleExpanded = () => {
    // Configure animation
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        200, // duration
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );
    setExpanded(!expanded);

    // Run animation
    Animated.timing(expandAnimation, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.ease),
    }).start();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // If text is empty, clear results
    if (!text.trim()) {
      setLocationResults([]);
      setIsSearching(false);
      return;
    }
    debouncedSearch(text);
  };

  const handleSelectLocation = async (item: LocationResult) => {
    try {
      setIsSearching(true);
      const locationData = await utils.client.locations.getPlaceDetails.query({
        placeId: item.placeId,
        precision: mode,
      });
      onChange(locationData);
      setExpanded(false); // Collapse the component after selection
    } catch (error) {
      console.error("Error getting place details:", error);

      // Check if it's a NOT_FOUND error - this is handled in the API now
      const errorObj = error as any;
      if (errorObj?.shape?.data?.code === "NOT_FOUND") {
        // Handle not found error gracefully - just show a user-friendly message
        Alert.alert(
          "Location Not Found",
          "We couldn't find details for this location. Please try another search."
        );
      } else {
        // For other errors, log and show generic error
        if (onError) onError(error as Error);
        Alert.alert(
          "Error",
          "Failed to get location details. Please try again."
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);

      // Request permission to access the device's location
      const permissionGranted = await requestForegroundLocationPermission();
      if (!permissionGranted) {
        Alert.alert(
          "Location Permission Required",
          "Please enable location services to use this feature."
        );
        setIsGettingLocation(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode the coordinates
      const { latitude, longitude } = location.coords;
      const locationData =
        await utils.client.locations.getLocationFromCoords.query({
          lat: latitude,
          lng: longitude,
        });

      onChange(locationData);
      setExpanded(false); // Collapse the component after selection
    } catch (error) {
      console.error("Error getting current location:", error);
      if (onError) onError(error as Error);
      Alert.alert(
        "Location Error",
        "Unable to get your current location. Please try searching for your city instead."
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Calculate animated styles
  const maxHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 350], // Adjust these values as needed
  });

  const borderRadius = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [12, expanded ? 12 : 12], // Keep consistent border radius
  });

  const opacity = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View className={containerClassName}>
      {/* Label */}
      {label && (
        <Text style={labelStyle} className={labelClassName}>
          {label}
        </Text>
      )}

      {/* Animated container */}
      <Animated.View
        style={{
          overflow: "hidden",
          borderWidth: 1,
          borderColor: error ? colors.danger.DEFAULT : colors.border,
          borderRadius: borderRadius,
          backgroundColor: "white",
          minHeight: 40,
        }}
      >
        {/* Header/Selected Value */}
        <Pressable
          onPress={toggleExpanded}
          className="bg-white px-4 py-3 flex-row items-center justify-between"
        >
          <Text
            className={`text-base ${
              normalizedValue?.formatted ? "text-foreground" : "text-muted"
            }`}
          >
            {normalizedValue ? normalizedValue.formatted : effectivePlaceholder}
          </Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.muted.DEFAULT}
          />
        </Pressable>

        {/* Expandable content */}
        {expanded && (
          <View>
            {/* Divider */}
            <View className="border-t border-border" />

            {/* Search input */}
            <View className="p-3 bg-background">
              <View
                className="flex-row items-center"
                style={[
                  textInputStyles.standard,
                  { paddingHorizontal: 12 },
                ]}
              >
                <Ionicons
                  name="search"
                  size={20}
                  color={colors.muted.DEFAULT}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  ref={searchInputRef}
                  className="flex-1"
                  placeholder={effectivePlaceholder}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  autoCapitalize="none"
                  style={{
                    fontSize: 16,
                    color: colors.foreground,
                    paddingVertical: 0,
                  }}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => handleSearch("")}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    style={{ marginLeft: 8 }}
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      color={colors.muted.DEFAULT}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Current location button - only show for city mode */}
              {mode === "city" && (
                <TouchableOpacity
                  onPress={handleUseCurrentLocation}
                  disabled={isGettingLocation}
                  className={`flex-row items-center mt-3 p-3 rounded-xl ${
                    isGettingLocation ? "opacity-50" : ""
                  }`}
                  style={{ backgroundColor: colors.accent }}
                >
                  {isGettingLocation ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.primary}
                      style={{ marginRight: 10 }}
                    />
                  ) : (
                    <Ionicons
                      name="locate"
                      size={20}
                      color={colors.primary}
                      style={{ marginRight: 10 }}
                    />
                  )}
                  <Text
                    className="text-base font-medium"
                    style={{ color: colors.primary }}
                  >
                    Use my current location
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Divider */}
            <View className="border-t border-border" />

            {/* Search results */}
            <View style={{ maxHeight: 200 }}>
              {isSearching ? (
                <View className="py-4 items-center justify-center">
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text className="text-muted mt-2">Searching...</Text>
                </View>
              ) : locationResults.length > 0 ? (
                <ScrollView
                  nestedScrollEnabled={true}
                  style={{ maxHeight: 200 }}
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  {locationResults.map((item) => (
                    <TouchableOpacity
                      key={item.placeId}
                      className="p-3 border-b border-border"
                      onPress={() => handleSelectLocation(item)}
                    >
                      <Text className="text-base font-medium text-foreground">
                        {item.mainText}
                      </Text>
                      <Text className="text-sm text-muted">
                        {item.secondaryText}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : searchQuery.length > 1 ? (
                <View className="p-4 items-center">
                  <Text className="text-muted">No results found</Text>
                </View>
              ) : (
                <View className="p-4 items-center">
                  <Text className="text-muted">Type to search locations</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </Animated.View>

      {/* Error message */}
      {error && <Text className="text-sm text-danger mt-1">{error}</Text>}

      {/* Helper text */}
      {helperText && !error && (
        <Text className="text-sm text-muted mt-1">{helperText}</Text>
      )}
    </View>
  );
};

export default LocationPicker;
