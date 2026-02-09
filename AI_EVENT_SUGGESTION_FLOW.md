# AI Event Suggestion Algorithm

## Overview

The event suggestion algorithm takes a natural language activity description from the user and intelligently matches it against existing events using personalized scoring, activity matching, and constraint filtering.

## Algorithm Flow

### Step 1: Get Base Personalized Events

**Function:** `getSuggestedEventsFromUser(userId)`

Fetches and scores all valid events for the user based on their profile:

1. **Fetch User Profile Data**
   - User's interests (e.g., hiking, board games, photography)
   - User's personality trait scores (e.g., openness, extraversion)
   - User's location and travel radius preferences
   - User's age for age-restricted events

2. **Fetch Valid Events**
   - Only future events (not past or cancelled)
   - Within user's travel radius from their location
   - Events that match user's age (within min/max age limits)

3. **Calculate Match Score for Each Event**
   - **Interest Overlap Score**: Measures how many of the user's interests match the event's activity tags
   - **Trait Similarity Score**: Uses cosine similarity to compare user's personality traits with the event organizer's traits
   - **Combined Score**: Weighted combination of interest overlap and trait similarity
   - **Returns top 10 highest-scoring events only**

**Important:** This step acts as a pre-filter that limits to top 10 events **across ALL activities** by compatibility score.

**Critical Limitation:** If a user searches for "fishing" and there are 100 fishing events available, but their top 10 personality matches are all hiking events, they will see **zero fishing results** - even if fishing event #11 would be a great match. The algorithm optimizes for personality match first, activity match second, which means activity-specific searches can return no results when there are actually many relevant events available. This is a fundamental flaw when users have a specific activity in mind.

### Step 2: Activity Matching with AI

**Function:** `getActivityFromDesc(activityDescription)`

Converts the natural language activity description into a structured activity:

1. **Generate Embedding**
   - Takes user's activity description (e.g., "outdoor hiking with a group")
   - Uses OpenAI's `text-embedding-3-small` model to create a vector embedding
   - Embedding captures semantic meaning of the activity

2. **Vector Similarity Search**
   - Compares the query embedding against all activities in the database using pgvector
   - Uses cosine similarity to find the closest matching activity
   - Returns the single best matching activity (e.g., "Hiking" activity)

### Step 3: Filter and Sort Events

**Function:** `filterAndSortEvents(events, activity, groupSize, startTime, endTime)`

Applies user-specified constraints and ranks results:

1. **Activity Filter** (Hard Filter)
   - Only keeps events where `event.activityId == activity.id`
   - Ensures events match the semantic meaning of what user requested
   - **This is a hard filter** - events with wrong activity are completely excluded

2. **Time Window Filter** (Hard Filter - if specified)
   - Only keeps events where `startTime <= event.startsAt <= endTime`
   - Allows users to specify "this weekend" or "next week"

3. **Group Size Filter** (Hard Filter - if specified)
   - Only keeps events where `event.minAttendees <= groupSize <= event.maxAttendees`
   - Ensures the user's desired group fits within event capacity

4. **Sort by Match Score** (Soft Ranking)
   - Events are already pre-scored from Step 1
   - Returns filtered events sorted by score (highest first)
   - **Personality match is only used for sorting, not filtering at this stage**
   - Best personality and interest matches appear first, but events with lower compatibility still show if they passed all hard filters

## Key Algorithm Features

**Two-Stage Filtering Approach**

- **Stage 1 (Personalization):** Hard limit to top 10 events **overall across all activities** by personality/interest match score
- **Stage 2 (Activity/Constraints):** Hard filters by activity, time, and group size; soft ranking by personality score
- Events with very poor personality matches are excluded early (Stage 1)
- Events with decent personality matches show if they match activity, even if not the best match
- **Critical Flaw:** Top 10 is calculated BEFORE activity filtering, so if your top 10 are all one activity type, searching for a different activity returns zero results even if hundreds of that activity exist. The algorithm prioritizes personality over user intent.

**Personalization**

- Uses user's interests and personality traits for scoring
- Considers location proximity and travel preferences
- Respects age restrictions
- Top 10 pre-filter ensures only reasonable personality matches are considered

**Semantic Activity Matching**

- AI embeddings capture meaning, not just keywords
- "hiking outdoors" matches "Hiking" activity even with different wording
- Vector similarity ensures relevant activity type
- Activity match is a hard requirement (Stage 2)

**Flexible Constraints**

- All filters are optional except activity description
- Time window can be vague ("this weekend") - handled by AI conversation layer
- Group size is optional - defaults to all valid sizes

**Scoring & Ranking**

- Events pre-scored based on user compatibility
- Personality score acts as both early filter (top 10) and final sort order
- Within matching activity/constraints, best personality matches shown first
- Lower personality matches still appear if they made top 10 and match activity
- Filtering preserves score ordering
- Most compatible events shown first within matching criteria
