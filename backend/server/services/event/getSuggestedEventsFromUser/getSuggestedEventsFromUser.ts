import { Event } from "@/types/Event";
import { User } from "@/types/User";
import { Database } from "../../../prisma";

// input: User
// outputs: ranked list of events
export function getSuggestedEventsFromUser(user: User, db: Database): Event[] {
  const eventResults: Event[] = [];
  return eventResults;
}
