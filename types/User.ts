import { Location } from "./Location";

// used for the getSuggestedEventsFromUser flow
export interface UserWithTraitsAndInterests {
  id: string;
  birthday: Date | null;
  traits: Record<string, number>;
  interests: string[];
  maxTravelKm: number | null;
  location: Location | null;
}
