/**
 * Calculates the interest overlap score between a user's interests and an event's interests.
 *
 * The score represents the proportion of user interests that match the event interests,
 * calculated as the number of overlapping interests divided by the total number of user interests.
 *
 * @param userInterests - An array of strings representing the user's interests
 * @param eventInterests - An array of strings representing the event's interests
 * @returns A number between 0 and 1 representing the overlap score, where:
 *          - 0 indicates no overlap
 *          - 1 indicates all user interests match event interests
 * @throws {Error} If userInterests or eventInterests are undefined
 *
 * @example
 * ```typescript
 * getInterestOverlapScore(['sports', 'music'], ['sports', 'art', 'music'])
 * // Returns: 1 (both user interests match)
 *
 * getInterestOverlapScore(['sports', 'gaming'], ['music', 'art'])
 * // Returns: 0 (no overlap)
 * ```
 */
export function getInterestOverlapScore(
  userInterests: string[],
  eventInterests: string[]
): number {
  if (!userInterests || !eventInterests) {
    throw new Error("userInterest and eventInterests must be defined");
  } else if (userInterests.length === 0 || eventInterests.length === 0) {
    return 0;
  }

  const eventSet = new Set(eventInterests);
  const overlapCount = userInterests.filter((i) => eventSet.has(i)).length;
  const numUserInterests = userInterests.length;

  return overlapCount / numUserInterests;
}
