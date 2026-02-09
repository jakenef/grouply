import { getAllScoredValidEventsFromUser } from "../getAllScoredValidEventsFromUser/getAllScoredValidEventsFromUser";

/**
 * Gets personalized event suggestions for a user based on their profile, interests, and traits.
 *
 * This function performs the following steps:
 * 1. Fetches user data including interests, trait scores, location, and travel preferences
 * 2. Retrieves valid events (future events within travel radius that match user's age)
 * 3. Scores each event based on interest overlap and trait similarity with the user
 * 4. Returns the top 10 highest-scoring events
 *
 * @param userId - The unique identifier of the user to get suggestions for
 * @returns Promise resolving to an array of up to 10 scored events, sorted by match score (highest first)
 *
 * @example
 * const suggestions = await getSuggestedEventsFromUser("user-123");
 * // Returns: [{ event: EventWithSnapshotData, score: 0.85 }, ...]
 *
 * @throws Will throw if user or userProfile doesn't exist in database
 */
export async function getSuggestedEventsFromUser(userId: string) {
  // Now sort and slice
  const k = 10;
  const suggestedEvents = (await getAllScoredValidEventsFromUser(userId)).slice(
    0,
    k,
  );

  return suggestedEvents;
}
