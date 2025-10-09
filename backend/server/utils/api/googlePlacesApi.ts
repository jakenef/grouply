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

  async getPlaceAutocomplete(query: string): Promise<PlacePrediction[]> {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&types=(cities)&key=${this.apiKey}`;

    const response = await fetchWithErrorHandling<PlaceAutocompleteResponse>(
      url
    );

    if (response.status !== "OK") {
      throw new ApiError(`Google Places API Error: ${response.status}`, 500);
    }

    return response.predictions;
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,address_component&key=${this.apiKey}`;

    const response = await fetchWithErrorHandling<PlaceDetailsResponse>(url);

    if (response.status !== "OK") {
      throw new ApiError(`Google Places API Error: ${response.status}`, 500);
    }

    return response.result;
  }

  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResponse> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality&key=${this.apiKey}`;

    const response = await fetchWithErrorHandling<GeocodeResponse>(url);

    if (response.status !== "OK") {
      throw new ApiError(`Google Geocoding API Error: ${response.status}`, 500);
    }

    return response;
  }

  /**
   * Extract location data from place details
   */
  extractLocationData(placeDetails: PlaceDetails) {
    const addressComponents = placeDetails.address_components;
    let city, region, country, countryCode;

    for (const component of addressComponents) {
      if (component.types.includes("locality")) {
        city = component.long_name;
      } else if (component.types.includes("administrative_area_level_1")) {
        region = component.long_name;
      } else if (component.types.includes("country")) {
        country = component.long_name;
        countryCode = component.short_name;
      }
    }

    return {
      city,
      region,
      country,
      countryCode,
      lat: placeDetails.geometry.location.lat,
      lng: placeDetails.geometry.location.lng,
      formatted: `${city || ""}, ${region || ""}, ${country || ""}`
        .replace(/^, |, ,/g, "")
        .replace(/, $/g, ""),
    };
  }
}

// Export singleton instance
export const googlePlacesApi = new GooglePlacesApi();
