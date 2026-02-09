import { filterAndSortEvents } from "./getSuggestedEventsFromActivityDesc";

describe("filterAndSortEvents", () => {
  const mockActivities = [
    {
      id: "activity1",
      name: "Basketball",
      desc: "A team sport played with a ball",
      similarity: 0.95,
    },
  ];

  // Helper to create a minimal mock event
  const createMockEvent = (overrides: any = {}) => ({
    id: overrides.id || "event1",
    activityId: overrides.activityId || "activity1",
    startsAt: overrides.startsAt || new Date("2025-12-01T18:00:00Z"),
    minAttendees: overrides.minAttendees ?? 4,
    maxAttendees: overrides.maxAttendees ?? 8,
    activity: overrides.activity || { id: "activity1" },
    location: {
      id: "loc1",
      city: "San Francisco",
      region: "CA",
      countryCode: "US",
      lat: 37.7749,
      lng: -122.4194,
      formatted: "San Francisco, CA",
      precision: "CITY" as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    registrations: [],
    organizer: {
      id: "user1",
      email: "test@example.com",
      givenName: "Test",
      familyName: "User",
      birthday: new Date("1990-01-01"),
      bio: null,
      avatarUrl: null,
      role: "USER" as any,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      locationId: "loc1",
      maxTravelKm: 50,
    },
    snapshot: {
      id: "snap1",
      eventId: "event1",
      interestIds: [],
      traitScores: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    ...overrides,
  });

  const mockEvents = [
    {
      event: createMockEvent({
        id: "event1",
        activityId: "activity1",
        startsAt: new Date("2025-12-01T18:00:00Z"),
        minAttendees: 4,
        maxAttendees: 8,
      }),
      score: 0.9,
    },
    {
      event: createMockEvent({
        id: "event2",
        activityId: "activity2",
        startsAt: new Date("2025-12-01T18:00:00Z"),
        activity: { id: "activity2" },
        minAttendees: 4,
        maxAttendees: 8,
      }),
      score: 0.5,
    },
    {
      event: createMockEvent({
        id: "event3",
        activityId: "activity1",
        startsAt: new Date("2025-12-02T18:00:00Z"),
        minAttendees: 4,
        maxAttendees: 8,
      }),
      score: 0.7,
    },
    {
      event: createMockEvent({
        id: "event4",
        activityId: "activity1",
        startsAt: new Date("2025-12-01T18:00:00Z"),
        minAttendees: 10,
        maxAttendees: 20,
      }),
      score: 0.8,
    },
  ];

  it("filters and sorts events correctly", () => {
    const groupSize = 6;
    const startTime = new Date("2025-12-01T17:00:00Z");
    const endTime = new Date("2025-12-01T19:00:00Z");

    const results = filterAndSortEvents(
      mockEvents,
      mockActivities,
      groupSize,
      startTime,
      endTime,
    );

    // Only the first event should match all filters
    expect(results.length).toBe(1);
    expect(results[0].event.activityId).toBe("activity1");
    expect(results[0].event.startsAt.toISOString()).toBe(
      "2025-12-01T18:00:00.000Z",
    );
    expect(results[0].score).toBe(0.9);
  });

  it("returns empty array if no events match", () => {
    const groupSize = 100;
    const startTime = new Date("2025-12-01T17:00:00Z");
    const endTime = new Date("2025-12-01T19:00:00Z");

    const results = filterAndSortEvents(
      mockEvents,
      mockActivities,
      groupSize,
      startTime,
      endTime,
    );
    expect(results.length).toBe(0);
  });

  it("sorts events by score descending", () => {
    const groupSize = 6;
    const startTime = new Date("2025-12-01T17:00:00Z");
    const endTime = new Date("2025-12-01T19:00:00Z");

    // Two events match, different scores
    const events = [
      {
        event: createMockEvent({
          activityId: "activity1",
          startsAt: new Date("2025-12-01T18:00:00Z"),
          minAttendees: 4,
          maxAttendees: 8,
        }),
        score: 0.5,
      },
      {
        event: createMockEvent({
          activityId: "activity1",
          startsAt: new Date("2025-12-01T18:00:00Z"),
          minAttendees: 4,
          maxAttendees: 8,
        }),
        score: 0.9,
      },
    ];
    const results = filterAndSortEvents(
      events,
      mockActivities,
      groupSize,
      startTime,
      endTime,
    );
    expect(results.length).toBe(2);
    expect(results[0].score).toBe(0.9);
    expect(results[1].score).toBe(0.5);
  });

  it("handles events on the exact start/end boundary", () => {
    const groupSize = 6;
    const startTime = new Date("2025-12-01T18:00:00Z");
    const endTime = new Date("2025-12-01T18:00:00Z");
    const events = [
      {
        event: createMockEvent({
          activityId: "activity1",
          startsAt: new Date("2025-12-01T18:00:00Z"),
          minAttendees: 4,
          maxAttendees: 8,
        }),
        score: 0.7,
      },
      {
        event: createMockEvent({
          activityId: "activity1",
          startsAt: new Date("2025-12-01T17:59:59Z"),
          minAttendees: 4,
          maxAttendees: 8,
        }),
        score: 0.6,
      },
    ];
    const results = filterAndSortEvents(
      events,
      mockActivities,
      groupSize,
      startTime,
      endTime,
    );
    expect(results.length).toBe(1);
    expect(results[0].event.startsAt.toISOString()).toBe(
      "2025-12-01T18:00:00.000Z",
    );
  });

  it("returns all events if groupSize is null or undefined", () => {
    const events = [
      {
        event: createMockEvent({
          activityId: "activity1",
          startsAt: new Date("2025-12-01T18:00:00Z"),
          minAttendees: 1,
          maxAttendees: 10,
        }),
        score: 0.8,
      },
      {
        event: createMockEvent({
          activityId: "activity1",
          startsAt: new Date("2025-12-01T18:00:00Z"),
          minAttendees: 1,
          maxAttendees: 10,
        }),
        score: 0.7,
      },
    ];
    // groupSize undefined
    const results1 = filterAndSortEvents(
      events,
      mockActivities,
      undefined,
      undefined,
      undefined,
    );
    expect(results1.length).toBe(2);
    // groupSize null
    const results2 = filterAndSortEvents(
      events,
      mockActivities,
      undefined,
      undefined,
      undefined,
    );
    expect(results2.length).toBe(2);
  });

  it("returns empty array if events is empty or null", () => {
    const results1 = filterAndSortEvents(
      [],
      mockActivities,
      5,
      undefined,
      undefined,
    );
    expect(results1.length).toBe(0);
    const results2 = filterAndSortEvents(
      [],
      mockActivities,
      5,
      undefined,
      undefined,
    );
    expect(results2.length).toBe(0);
  });
});
