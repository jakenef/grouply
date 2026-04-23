import { env } from "../../env";
import { ApiError, fetchWithErrorHandling } from "./baseApi";

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface PlaceAutocompleteResponse {
  predictions: PlacePrediction[];
  status: string;
}

export interface PlaceDetailsResponse {
  result: PlaceDetails;
  status: string;
}

export interface GeocodeResponse {
  results: Array<{
    place_id: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  status: string;
}

export class GooglePlacesApi {
  private apiKey: string;

  constructor() {
    if (!env.GOOGLE_PLACES_API_KEY) {
      throw new Error("Google Places API key is not configured");
    }
    this.apiKey = env.GOOGLE_PLACES_API_KEY;
  }

  async getPlaceAutocomplete(
    query: string,
    types?: string
  ): Promise<PlacePrediction[]> {
    const typesParam = types ? `&types=${types}` : "";
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}${typesParam}&key=${this.apiKey}`;

    const response = await fetchWithErrorHandling<PlaceAutocompleteResponse>(
      url
    );

    console.log(`[GooglePlacesApi] autocomplete status=${response.status} predictions=${response.predictions?.length ?? 0}`);

    // Handle "ZERO_RESULTS" as a normal case - just return empty predictions
    if (response.status === "ZERO_RESULTS") {
      return [];
    }

    // Other non-OK statuses are still errors
    if (response.status !== "OK") {
      throw new ApiError(`Google Places API Error: ${response.status}`, 500);
    }

    return response.predictions;
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,address_component,formatted_address&key=${this.apiKey}`;

    const response = await fetchWithErrorHandling<PlaceDetailsResponse>(url);

    // Handle "ZERO_RESULTS" as a normal case - return null
    if (response.status === "ZERO_RESULTS") {
      return null;
    }

    // Other non-OK statuses are still errors
    if (response.status !== "OK") {
      throw new ApiError(`Google Places API Error: ${response.status}`, 500);
    }

    return response.result;
  }

  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResponse> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality&key=${this.apiKey}`;

    const response = await fetchWithErrorHandling<GeocodeResponse>(url);

    // Handle "ZERO_RESULTS" as a normal case - return response with empty results
    if (response.status === "ZERO_RESULTS") {
      return { ...response, results: [] };
    }

    // Other non-OK statuses are still errors
    if (response.status !== "OK") {
      throw new ApiError(`Google Geocoding API Error: ${response.status}`, 500);
    }

    return response;
  }

  /**
   * Extract location data from place details
   */
  extractLocationData(
    placeDetails: PlaceDetails | null,
    isVenue: boolean = false
  ) {
    // If no place details provided, return empty/default data
    if (!placeDetails) {
      return {
        city: null,
        region: null,
        country: null,
        countryCode: null,
        lat: null,
        lng: null,
        formatted: "",
        name: null,
      };
    }

    const addressComponents = placeDetails.address_components;
    let city, region, country, countryCode, streetNumber, route, subpremise;

    for (const component of addressComponents) {
      if (component.types.includes("locality")) {
        city = component.long_name;
      } else if (component.types.includes("administrative_area_level_1")) {
        region = component.long_name;
      } else if (component.types.includes("country")) {
        country = component.long_name;
        countryCode = component.short_name;
      } else if (component.types.includes("street_number")) {
        streetNumber = component.long_name;
      } else if (component.types.includes("route")) {
        route = component.long_name;
      } else if (component.types.includes("subpremise")) {
        subpremise = component.long_name;
      }
    }

    // For venues/establishments, use the place name and full address
    // For cities, just use the city/region/country format
    let formatted: string;
    if (isVenue) {
      const addressParts = [];
      if (streetNumber && route) {
        const streetAddress = subpremise
          ? `${streetNumber} ${route} #${subpremise}`
          : `${streetNumber} ${route}`;
        addressParts.push(streetAddress);
      } else if (route) {
        addressParts.push(route);
      }
      if (city) addressParts.push(city);
      if (region) addressParts.push(region);
      formatted = addressParts.join(", ");

      // If there's a place name that's different from the address, prepend it
      // This handles named places like "Kiwanis Park" or "Walmart"
      const placeName = placeDetails.name;
      if (placeName) {
        // Check if the name is meaningful (not just the street address)
        // Names like "665 N 100 E #1" are just addresses, but "Kiwanis Park" is a real name
        const isJustAddress =
          placeName.match(/^\d+/) || // Starts with a number
          placeName.toLowerCase().includes(route?.toLowerCase() || "");

        if (!isJustAddress) {
          formatted = `${placeName}, ${formatted}`;
        }
      }
    } else {
      formatted = `${city || ""}, ${region || ""}, ${country || ""}`
        .replace(/^, |, ,/g, "")
        .replace(/, $/g, "");
    }

    return {
      city,
      region,
      country,
      countryCode,
      lat: placeDetails.geometry.location.lat,
      lng: placeDetails.geometry.location.lng,
      formatted,
      name: isVenue ? placeDetails.name : null,
    };
  }
}

// Export singleton instance
export const googlePlacesApi = new GooglePlacesApi();
