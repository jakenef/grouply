import { prisma } from "@/backend/server/prisma";
import { getSuggestedEventsFromUser } from "./getSuggestedEventsFromUser";

describe("getSuggestedEventsFromUser integration", () => {
  let testUserId: string;
  let testLocationId: string;
  let testActivityId: string;
  let testInterestId: string;
  let testTraitId: string;
  let highScoreEventId: string;
  let lowScoreEventId: string;

  beforeAll(async () => {
    // Create prerequisite data
    const interest = await prisma.interest.create({
      data: { slug: "hiking-test", label: "Hiking", isApproved: true },
    });
    testInterestId = interest.id;

    const trait = await prisma.trait.create({
      data: { slug: "introversion", label: "Introversion", isApproved: true },
    });
    testTraitId = trait.id;

    const activity = await prisma.activity.create({
      data: { slug: "outdoor-hiking", label: "Outdoor Hiking" },
    });
    testActivityId = activity.id;

    const location = await prisma.location.create({
      data: {
        lat: 40.7,
        lng: -74.0,
        precision: "CITY",
        city: "New York",
        countryCode: "US",
      },
    });
    testLocationId = location.id;

    // Create test user with interests and traits
    const user = await prisma.user.create({
      data: {
        authUserId: "auth-test-user",
        email: "test@example.com",
        givenName: "Test User",
        locationId: testLocationId,
        birthday: new Date("1990-01-01"), // 35 years old
        maxTravelKm: 50,
        interests: {
          create: [{ interestId: testInterestId, weight: 1 }],
        },
        traitScores: {
          create: [{ traitId: testTraitId, score: 0.7 }],
        },
      },
    });
    testUserId = user.id;

    // Create high-match event (similar interests and traits)
    const highMatchEvent = await prisma.event.create({
      data: {
        name: "Great Hiking Trip",
        desc: "A wonderful hiking experience",
        startsAt: new Date("2025-12-01T10:00:00Z"),
        endsAt: new Date("2025-12-01T16:00:00Z"),
        additionalImageUrls: ["https://example.com/image.jpg"],
        minAttendees: 2,
        organizerId: testUserId,
        activityId: testActivityId,
        locationId: testLocationId,
        minAgeLimit: 18,
        maxAgeLimit: 50,
        maxAttendees: 20,
        coverImageUrl: "test",
        snapshot: {
          create: {
            hostUserId: testUserId,
            hostGivenName: "Test User",
            interestIds: [testInterestId], // Matches user's hiking interest
            traitScores: { [testTraitId]: 0.8 }, // Close to user's 0.7
          },
        },
      },
    });
    highScoreEventId = highMatchEvent.id;

    // Create low-match event (different interests and traits)
    const lowMatchEvent = await prisma.event.create({
      data: {
        name: "Different Event",
        desc: "An event with no overlap",
        startsAt: new Date("2025-12-15T10:00:00Z"),
        endsAt: new Date("2025-12-15T16:00:00Z"),
        additionalImageUrls: [],
        organizerId: testUserId,
        activityId: testActivityId,
        locationId: testLocationId,
        minAgeLimit: 18,
        maxAgeLimit: 50,
        minAttendees: 2,
        maxAttendees: 20,
        coverImageUrl: "test",
        snapshot: {
          create: {
            hostUserId: testUserId,
            hostGivenName: "Test User",
            interestIds: [], // No matching interests
            traitScores: { [testTraitId]: 0.1 }, // Very different from user's 0.7
          },
        },
      },
    });
    lowScoreEventId = lowMatchEvent.id;
  });

  it("returns events ranked by match score with higher scoring events first", async () => {
    const results = await getSuggestedEventsFromUser(testUserId);

    // Should return both events
    expect(results.length).toBeGreaterThanOrEqual(2);

    // First event should be the high-scoring one
    expect(results[0].event.id).toBe(highScoreEventId);
    expect(results[0].score).toBeGreaterThan(0);

    // Second event should be the low-scoring one
    expect(results[1].event.id).toBe(lowScoreEventId);
    expect(results[1].score).toBeGreaterThanOrEqual(0);

    // High score should be greater than low score
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });

  afterAll(async () => {
    // Clean up only test data by ID in reverse dependency order
    await prisma.eventProfileSnapshot.deleteMany({
      where: { eventId: { in: [highScoreEventId, lowScoreEventId] } },
    });
    await prisma.event.deleteMany({
      where: { id: { in: [highScoreEventId, lowScoreEventId] } },
    });
    await prisma.userTraitScore.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.userInterest.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.deleteMany({
      where: { id: testUserId },
    });
    await prisma.activity.deleteMany({
      where: { id: testActivityId },
    });
    await prisma.location.deleteMany({
      where: { id: testLocationId },
    });
    await prisma.trait.deleteMany({
      where: { id: testTraitId },
    });
    await prisma.interest.deleteMany({
      where: { id: testInterestId },
    });
    await prisma.$disconnect();
  });
});
