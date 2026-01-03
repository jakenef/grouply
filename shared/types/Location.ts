export type LocationPrecision = "city" | "point";

export type Location = {
  id: string;
  formatted: string;
  city: string | null;
  region: string | null;
  countryCode: string | null;
  lat: number;
  lng: number;
  precision: LocationPrecision;
};
