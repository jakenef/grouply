import { router } from "../../trpc";
import { getSuggestedEventsFromUser } from "./getSuggestedEventsFromUser";

export const eventsRouter = router({
  getSuggestedEventsFromUser,
});
