import { getTraitSimilarityScore } from "./getTraitSimilarityScore";

describe("getTraitSimilarityScore", () => {
  it("should return 1 for identical traits", () => {
    const traits = { trait1: 0.5, trait2: 0.8, trait3: 0.3 };
    expect(getTraitSimilarityScore(traits, traits)).toBe(1);
  });

  it("should return 0 when user traits are empty", () => {
    const eventTraits = { trait1: 0.5, trait2: 0.8 };
    expect(getTraitSimilarityScore({}, eventTraits)).toBe(0);
  });

  it("should return 0 when event traits are empty", () => {
    const userTraits = { trait1: 0.5, trait2: 0.8 };
    expect(getTraitSimilarityScore(userTraits, {})).toBe(0);
  });

  it("should return 0 when both trait sets are empty", () => {
    expect(getTraitSimilarityScore({}, {})).toBe(0);
  });

  it("should return 0 for completely orthogonal traits", () => {
    const userTraits = { trait1: 1 };
    const eventTraits = { trait2: 1 };
    expect(getTraitSimilarityScore(userTraits, eventTraits)).toBe(0);
  });

  it("should calculate higher similarity for similar trait collections than different trait collections", () => {
    const userTraits = { trait1: 1, trait2: 0.3, trait3: 0.2 };
    const eventTraits = { trait1: 0.7, trait2: 0.2, trait3: 0 };
    const otherUserTraits = { trait1: 0, trait2: 1, trait3: 0.8 };

    const similarScore = getTraitSimilarityScore(userTraits, eventTraits);
    const differentScore = getTraitSimilarityScore(
      otherUserTraits,
      eventTraits
    );

    expect(similarScore > differentScore).toBe(true);
  });

  it("should rank three users correctly by similarity to event", () => {
    const eventTraits = { adventurous: 0.9, social: 0.7, creative: 0.3 };

    // User 1: Very similar to event (high adventurous, high social)
    const user1Traits = { adventurous: 0.8, social: 0.6, creative: 0.2 };

    // User 2: Somewhat similar (medium on all)
    const user2Traits = { adventurous: 0.5, social: 0.5, creative: 0.5 };

    // User 3: Very different (low adventurous, low social, high creative)
    const user3Traits = { adventurous: 0.1, social: 0.2, creative: 0.9 };

    const score1 = getTraitSimilarityScore(user1Traits, eventTraits);
    const score2 = getTraitSimilarityScore(user2Traits, eventTraits);
    const score3 = getTraitSimilarityScore(user3Traits, eventTraits);

    expect(score1).toBeGreaterThan(score2);
    expect(score2).toBeGreaterThan(score3);
  });

  it("should prefer users with dominant matching traits over balanced traits", () => {
    const eventTraits = { sporty: 1, artistic: 0, intellectual: 0 };

    // User 1: Very sporty, nothing else (strong match on key trait)
    const focusedUser = { sporty: 0.9, artistic: 0, intellectual: 0 };

    // User 2: Balanced across all traits (weaker match)
    const balancedUser = { sporty: 0.5, artistic: 0.5, intellectual: 0.5 };

    const focusedScore = getTraitSimilarityScore(focusedUser, eventTraits);
    const balancedScore = getTraitSimilarityScore(balancedUser, eventTraits);

    expect(focusedScore).toBeGreaterThan(balancedScore);
  });

  it("should match users with similar trait patterns regardless of scale", () => {
    const eventTraits = { trait1: 0.6, trait2: 0.4, trait3: 0.2 };

    // Same proportions, different scales
    const userTraits = { trait1: 0.3, trait2: 0.2, trait3: 0.1 };

    const score = getTraitSimilarityScore(userTraits, eventTraits);

    // Should be very high similarity (same proportions)
    expect(score).toBeGreaterThan(0.99);
  });

  it("should distinguish between similar and opposite trait profiles", () => {
    const eventTraits = { outgoing: 0.8, organized: 0.2, spontaneous: 0.9 };

    // Similar profile
    const similarUser = { outgoing: 0.7, organized: 0.3, spontaneous: 0.8 };

    // Opposite profile
    const oppositeUser = { outgoing: 0.2, organized: 0.8, spontaneous: 0.1 };

    const similarScore = getTraitSimilarityScore(similarUser, eventTraits);
    const oppositeScore = getTraitSimilarityScore(oppositeUser, eventTraits);

    expect(similarScore).toBeGreaterThan(oppositeScore);
    expect(oppositeScore).toBeLessThan(0.5); // Should be quite different
  });

  it("should handle comparison of users with partial trait overlap", () => {
    const eventTraits = { trait1: 0.8, trait2: 0.6, trait3: 0.4, trait4: 0.2 };

    // User 1: Strong match on high-value traits
    const user1 = { trait1: 0.9, trait2: 0.7, trait3: 0, trait4: 0 };

    // User 2: Strong match on low-value traits
    const user2 = { trait3: 0.5, trait4: 0.3 };

    const score1 = getTraitSimilarityScore(user1, eventTraits);
    const score2 = getTraitSimilarityScore(user2, eventTraits);

    expect(score1).toBeGreaterThan(score2);
  });

  it("should correctly compare multiple users for event recommendation with sparse trait vectors", () => {
    // Event: High-energy outdoor activity (has 4 key traits)
    const eventTraits = {
      energetic: 0.9,
      outdoorsy: 1,
      competitive: 0.7,
      social: 0.8,
    };

    // Perfect match: Has all 4 event traits + some others, closely matches values
    const perfectMatch = {
      energetic: 0.85,
      outdoorsy: 0.95,
      competitive: 0.75,
      social: 0.8,
      organized: 0.3, // Extra trait event doesn't have
      creative: 0.2, // Extra trait event doesn't have
    };

    // Good match: Has 3/4 event traits (missing competitive), plus unrelated traits
    const goodMatch = {
      energetic: 0.7,
      outdoorsy: 0.8,
      social: 0.6,
      artistic: 0.9, // High on trait event doesn't care about
      introverted: 0.4, // Another unrelated trait
    };

    // Poor match: Only has 2/4 event traits (energetic, social), low values
    const poorMatch = {
      energetic: 0.2,
      social: 0.4,
      analytical: 0.8, // High on unrelated trait
      detail_oriented: 0.7, // High on unrelated trait
      patient: 0.6, // High on unrelated trait
    };

    // Wrong match: Has different traits entirely, minimal overlap
    const wrongMatch = {
      energetic: 0.1, // Only 1 overlapping trait, very low
      artistic: 0.9,
      introverted: 0.8,
      bookish: 0.9,
      calm: 0.85,
      methodical: 0.7,
    };

    const perfectScore = getTraitSimilarityScore(perfectMatch, eventTraits);
    const goodScore = getTraitSimilarityScore(goodMatch, eventTraits);
    const poorScore = getTraitSimilarityScore(poorMatch, eventTraits);
    const wrongScore = getTraitSimilarityScore(wrongMatch, eventTraits);

    expect(perfectScore).toBeGreaterThan(goodScore);
    expect(goodScore).toBeGreaterThan(poorScore);
    expect(poorScore).toBeGreaterThan(wrongScore);

    // Perfect match should be very high
    expect(perfectScore).toBeGreaterThan(0.95);
    // Wrong match should be very low
    expect(wrongScore).toBeLessThan(0.3);
  });

  it("should handle traits with different keys", () => {
    const userTraits = { trait1: 0.6, trait2: 0.8 };
    const eventTraits = { trait1: 0.6, trait3: 0.8 };
    const result = getTraitSimilarityScore(userTraits, eventTraits);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });

  it("should return value between 0 and 1", () => {
    const userTraits = { trait1: 0.7, trait2: 0.3 };
    const eventTraits = { trait1: 0.5, trait2: 0.9 };
    const result = getTraitSimilarityScore(userTraits, eventTraits);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});
