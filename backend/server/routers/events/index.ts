import { router } from "../../trpc";
import { generateEventFromChannel } from "./generateEventFromChannel";
import { getEventDetailsFromId } from "./getEventDetailsFromId";
import { getMyRegisteredEvents } from "./getMyRegisteredEvents";
import { getSuggestedEventsFromUser } from "./getSuggestedEventsFromUser";
import joinEvent from "./joinEvent";
import { upsertEvent } from "./upsertEvent";

export const eventsRouter = router({
  getSuggestedEventsFromUser,
  getEventDetailsFromId,
  generateEventFromChannel,
  upsertEvent,
  getMyRegisteredEvents,
  joinEvent,
});
