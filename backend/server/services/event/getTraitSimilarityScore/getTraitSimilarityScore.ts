/**
 * Calculates trait similarity between a user and an event host using cosine similarity.
 *
 * @param userTraits - Map of { traitId: score } for the user (scores 0–1)
 * @param eventTraits - Map of { traitId: score } for the event host (scores 0–1)
 * @returns A number between 0 and 1 where:
 *          1 = identical traits, 0 = no similarity
 */
export function getTraitSimilarityScore(
  userTraits: Record<string, number>,
  eventTraits: Record<string, number>
) {
  const userKeys = Object.keys(userTraits);
  const eventKeys = Object.keys(eventTraits);
  if (userKeys.length === 0 || eventKeys.length === 0) return 0;

  const allTraitIds = new Set([...userKeys, ...eventKeys]);

  // this finds cosine similarity (youre in a trait-space of n-dimensions, same direction means similar traits)

  let dot = 0;
  let userMagnitude = 0;
  let eventMagnitude = 0;

  for (const traitId of allTraitIds) {
    const u = userTraits[traitId] ?? 0;
    const e = eventTraits[traitId] ?? 0;
    // dot is the similarity, how much vectors project onto each other
    dot += u * e;
    // magnitude is for normalizing
    userMagnitude += u * u;
    eventMagnitude += e * e;
  }

  if (userMagnitude === 0 || eventMagnitude === 0) return 0;

  const similarity =
    dot / (Math.sqrt(userMagnitude) * Math.sqrt(eventMagnitude));

  // Clamp to [0, 1] in case of floating-point quirks
  return Math.min(1, Math.max(0, similarity));
}
