import { router } from "../../trpc";
import { getActivityById } from "./getById";
import { searchActivities } from "./search";

export const activitiesRouter = router({
  getById: getActivityById,
  search: searchActivities,
});
