# AI Event Suggestion Algorithm

## Overview

The event suggestion algorithm takes a user's natural language activity description and returns the best-matching events by combining personalized scoring, semantic activity matching, and constraint filtering.

## Algorithm Flow

### Step 1: Fetch and Score All Valid Events

- Retrieve all valid events for the user (future, within travel radius, age-appropriate, etc.).
  - See: [`getAllScoredValidEventsFromUser`](../../../backend/server/services/event/getAllScoredValidEventsFromUser/getAllScoredValidEventsFromUser.ts)
- For each event, calculate a similarity match score:
  - **Interest Overlap Score**: Proportion of user's interests that overlap with the event host's interests (from the event snapshot).
  - **Trait Similarity Score**: Cosine similarity between the user's trait vector and the event host's trait vector (from the event snapshot).
  - **Combined Score**: Average of interest and trait scores.
  - [See Similarity Matching Details](../matchingAlgorithm/SIMILARITY_MATCHING.md)
  - Scoring logic: [`getMatchScore`](../../../backend/server/services/event/getMatchScore/getMatchScore.ts)

- Discard events with very low match scores (bad matches).

### Step 2: Semantic Activity Matching

- Use AI embeddings to convert the user's activity description into a vector.
- Find all activities in the database that are semantically close to the user's description (using vector similarity search).
  - See: [`getActivitiesFromDesc`](../../../backend/server/services/activity/getActivityFromDesc.ts)

### Step 3: Filter Events by Activity

- Filter the previously scored events to only those whose activity matches the set of close activities from Step 2.

### Step 4: Apply Additional Filters

- Optionally filter by:
  - **Time window** (e.g., "this weekend"): Only keep events within the specified time range.
  - **Group size**: Only keep events where the user's desired group size fits the event's min/max attendees.

### Step 5: Sort and Return

- Sort the remaining events by their match score (highest first), but now sorted by activity similarity first, then match score within each activity group.
  - See: [`filterAndSortEvents`](../../../backend/server/services/event/getSuggestedEventsFromActivityDesc/getSuggestedEventsFromActivityDesc.ts)
- Return the sorted, filtered list as event suggestions.

---

## Key Features

- **Personalization**: Every event is scored for the user based on interests and traits before any activity filtering.
- **Semantic Activity Matching**: Uses AI embeddings to match user intent to activities, not just keywords.
- **Flexible Filtering**: Supports time, group size, and other constraints.
- **Ranking**: Final results are always sorted by compatibility score, so the best matches appear first.

---

**Note:**

- This approach ensures that users see only events that are both highly compatible and relevant to their requested activity, with no hard pre-filtering by personality before activity matching.
