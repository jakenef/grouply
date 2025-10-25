import { router } from "../../trpc";
import { getLocationFromCoords } from "./getLocationFromCoords";
import { getPlaceDetails } from "./getPlaceDetails";
import { searchLocations } from "./searchLocations";

export const locationsRouter = router({
  searchLocations,
  getPlaceDetails,
  getLocationFromCoords,
});
