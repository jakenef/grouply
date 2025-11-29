import { router } from "../../trpc";
import { getEventDetailsFromId } from "./getEventDetailsFromId";
import { getSuggestedEventsFromUser } from "./getSuggestedEventsFromUser";

export const eventsRouter = router({
  getSuggestedEventsFromUser,
  getEventDetailsFromId,
});
