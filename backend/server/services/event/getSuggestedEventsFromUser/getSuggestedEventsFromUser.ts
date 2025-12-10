import { EventWithSnapshotData } from "@/types/Event";
import { UserWithTraitsAndInterests } from "@/types/User";
import { prisma } from "../../../prisma";
import { getMatchScore } from "../getMatchScore/getMatchScore";
import { getValidEventsFromUser } from "../getValidEventsFromUser/getValidEventsFromUser";

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
  // get important information from user, transform into correct shapes
  const userFromDb = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      interests: true,
      traitScores: {
        include: {
          trait: true,
        },
      },
      location: true,
    },
  });
  const userProfileFromDb = await prisma.userProfile.findUnique({
    where: { userId },
  });

  const userInterests: string[] =
    userFromDb?.interests.map((interest) => interest.interestId) ?? [];
  const userTraits: Record<string, number> =
    userFromDb?.traitScores.reduce((acc, traitScore) => {
      acc[traitScore.trait.slug] = traitScore.score;
      return acc;
    }, {} as Record<string, number>) ?? {};

  const user: UserWithTraitsAndInterests = {
    id: userId,
    birthday: userProfileFromDb?.birthday ?? null,
    interests: userInterests,
    traits: userTraits,
    location: userFromDb?.location ?? (null as any),
    maxTravelKm: userProfileFromDb?.maxTravelKm ?? null,
  };

  // get possible events
  const validEvents = await getValidEventsFromUser(user);

  // for each of those, getMatchScore()
  const scoredEvents = validEvents.map((event) => {
    const eventWithSnapshotData: EventWithSnapshotData = {
      id: event.id,
      interests: event.snapshot?.interestIds ?? [],
      traits: (event.snapshot?.traitScores as Record<string, number>) ?? {},
    };
    const score = getMatchScore(eventWithSnapshotData, user);

    return { event, score };
  });

  // Now sort and slice
  const k = 10;
  const suggestedEvents = scoredEvents
    .sort((a, b) => b.score - a.score) // descending
    .slice(0, k);

  return suggestedEvents;
}
