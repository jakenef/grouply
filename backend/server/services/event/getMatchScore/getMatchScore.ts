import { EventWithSnapshotData } from "@/types/Event";
import { UserWithTraitsAndInterests } from "@/types/User";
import { getInterestOverlapScore } from "../getInterestOverlapScore/getInterestOverlapScore";
import { getTraitSimilarityScore } from "../getTraitSimilarityScore/getTraitSimilarityScore";

export function getMatchScore(
  event: EventWithSnapshotData,
  user: UserWithTraitsAndInterests
): number {
  const interestOverlapScore = getInterestOverlapScore(
    user.interests,
    event.interests
  );
  const traitSimilarityScore = getTraitSimilarityScore(
    user.traits,
    event.traits
  );

  const totalScore = (interestOverlapScore + traitSimilarityScore) / 2;

  return totalScore;
}
