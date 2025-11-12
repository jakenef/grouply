import { Event } from "@/types/Event";
import { User } from "@/types/User";
import { Database } from "../../../prisma";

// input: User
// outputs: ranked list of events
export function getSuggestedEventsFromUser(user: User, db: Database): Event[] {
  // 1. Get Valid Events From User
  // 2. for each of those, getMatchScore()
  // 3. add to pq or something, pop off top k matches
  const eventResults: Event[] = [];
  return eventResults;
}
