import { router } from "../../trpc";
import cancelEvent from "./cancelEvent";
import { generateEventFromChannel } from "./generateEventFromChannel";
import { getEventDetailsFromId } from "./getEventDetailsFromId";
import { getMyRegisteredEvents } from "./getMyRegisteredEvents";
import { getSuggestedEventsFromUser } from "./getSuggestedEventsFromUser";
import joinEvent from "./joinEvent";
import leaveEvent from "./leaveEvent";
import { upsertEvent } from "./upsertEvent";

export const eventsRouter = router({
  getSuggestedEventsFromUser,
  getEventDetailsFromId,
  generateEventFromChannel,
  upsertEvent,
  getMyRegisteredEvents,
  joinEvent,
  leaveEvent,
  cancelEvent,
});
