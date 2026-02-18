# Grouply Similarity Matching – Developer Documentation

Grouply computes user-to-event and user-to-user compatibility using two main components:

## 1. Interest Overlap Score

- **Definition:** Measures the proportion of a user's selected interests that overlap with the event host's interests (as captured in the user snapshot).
- **Formula Implementation:** [`getInterestOverlapScore`](../../../backend/server/services/event/getInterestOverlapScore/getInterestOverlapScore.ts)
- **Formula:**

  ```
  InterestOverlap = |UserInterests ∩ HostInterests| / |UserInterests|
  ```

  - `UserInterests`: The set of interest slugs selected by the user (5–10 required).
  - `HostInterests`: The set of interest slugs associated with the event host at the time of event creation (from the event snapshot).

- **Notes:**
  - This is an asymmetric measure: only the user's list length is used for normalization.
  - Users who select fewer interests will see each match count for more, but the 5–10 range keeps this effect small.

## 2. Trait Similarity Score (Cosine Similarity)

- **Definition:** Measures the similarity between the user's trait vector and the event host's trait vector (from the event snapshot) using cosine similarity.
- **Formula Implementation:** [`getTraitSimilarityScore`](../../../backend/server/services/event/getTraitSimilarityScore/getTraitSimilarityScore.ts)
- **Mathematical Formula:**
  $$
  \text{CosineSimilarity}(A, B) = \frac{A \cdot B}{\|A\| \times \|B\|}
  $$
  - $A$ = user trait vector (e.g., `{outgoing: 0.8, creative: 0.2, ...}`)
  - $B$ = event host trait vector (from snapshot)
  - $A \cdot B$ = dot product (sum of products for each trait, treating missing traits as 0)
  - $\|A\|$ = Euclidean norm (square root of sum of squares)
- **Properties:**
  - **Scale-invariant:** The score depends on the direction of the vectors, not their magnitude. Users with more traits (including zeros) are not penalized.
  - **Range:** 0 (completely dissimilar) to 1 (identical direction in trait space).
  - **Interpretation:** High score means the user's trait profile is proportionally similar to the host's, regardless of absolute values.

## 3. Combined Match Score

- **Definition:** The final compatibility score is the arithmetic mean of the Interest Overlap and Trait Similarity scores.
- **Scoring Logic:** [`getMatchScore`](../../../backend/server/services/event/getMatchScore/getMatchScore.ts)
- **Formula:**
  ```
  MatchScore = (InterestOverlap + TraitSimilarity) / 2
  ```

---

### Example Calculation

Suppose a user selects 6 interests, 3 of which overlap with the event host's snapshot:

- Interest Overlap = 3 / 6 = 0.5

Suppose the user's and host's trait vectors are:

- User: `{outgoing: 1, creative: 1}`
- Host: `{outgoing: 1, creative: 1, analytical: 1}`

Cosine similarity calculation:

- Dot product: (1×1) + (1×1) + (0×1) = 2
- User norm: √(1² + 1²) = √2 ≈ 1.414
- Host norm: √(1² + 1² + 1²) = √3 ≈ 1.732
- Cosine similarity = 2 / (1.414 × 1.732) ≈ 0.816

This shows that even if the user matches perfectly on the traits they have, the presence of extra traits in the host (that the user lacks) will lower the similarity score, reflecting partial but not perfect alignment.

Final Match Score = (0.5 + 0.816) / 2 = 0.658

---

**Summary:**

- Interest overlap is user-normalized and based on event host snapshot.
- Trait similarity uses cosine similarity for scale-invariant, proportional matching.
- The combined score is used for ranking and filtering event suggestions.
