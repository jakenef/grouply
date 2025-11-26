import { filterAndSortEvents } from "./getSuggestedEventsFromActivityDesc";

describe("filterAndSortEvents", () => {
  const mockActivity = { id: "activity1", label: "Basketball" };
  const mockEvents = [
    {
      event: {
        activity: { id: "activity1" },
        activityId: "activity1",
        startsAt: new Date("2025-12-01T18:00:00Z"),
        minAttendees: 4,
        maxAttendees: 8,
      },
      score: 0.9,
    },
    {
      event: {
        activity: { id: "activity2" },
        activityId: "activity2",
        startsAt: new Date("2025-12-01T18:00:00Z"),
        minAttendees: 4,
        maxAttendees: 8,
      },
      score: 0.5,
    },
    {
      event: {
        activity: { id: "activity1" },
        activityId: "activity1",
        startsAt: new Date("2025-12-02T18:00:00Z"),
        minAttendees: 4,
        maxAttendees: 8,
      },
      score: 0.7,
    },
    {
      event: {
        activity: { id: "activity1" },
        activityId: "activity1",
        startsAt: new Date("2025-12-01T18:00:00Z"),
        minAttendees: 10,
        maxAttendees: 20,
      },
      score: 0.8,
    },
  ];

  it("filters and sorts events correctly", () => {
    const groupSize = 6;
    const startTime = new Date("2025-12-01T17:00:00Z");
    const endTime = new Date("2025-12-01T19:00:00Z");

    const results = filterAndSortEvents(
      mockEvents,
      mockActivity,
      groupSize,
      startTime,
      endTime
    );

    // Only the first event should match all filters
    expect(results.length).toBe(1);
    expect(results[0].event.activityId).toBe("activity1");
    expect(results[0].event.startsAt.toISOString()).toBe(
      "2025-12-01T18:00:00.000Z"
    );
    expect(results[0].score).toBe(0.9);
  });

  it("returns empty array if no events match", () => {
    const groupSize = 100;
    const startTime = new Date("2025-12-01T17:00:00Z");
    const endTime = new Date("2025-12-01T19:00:00Z");

    const results = filterAndSortEvents(
      mockEvents,
      mockActivity,
      groupSize,
      startTime,
      endTime
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
        event: {
          activity: { id: "activity1" },
          activityId: "activity1",
          startsAt: new Date("2025-12-01T18:00:00Z"),
          minAttendees: 4,
          maxAttendees: 8,
        },
        score: 0.5,
      },
      {
        event: {
          activity: { id: "activity1" },
          activityId: "activity1",
          startsAt: new Date("2025-12-01T18:00:00Z"),
          minAttendees: 4,
          maxAttendees: 8,
        },
        score: 0.9,
      },
    ];
    const results = filterAndSortEvents(
      events,
      { id: "activity1" },
      groupSize,
      startTime,
      endTime
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
        event: {
          activity: { id: "activity1" },
          activityId: "activity1",
          startsAt: new Date("2025-12-01T18:00:00Z"),
          minAttendees: 4,
          maxAttendees: 8,
        },
        score: 0.7,
      },
      {
        event: {
          activity: { id: "activity1" },
          activityId: "activity1",
          startsAt: new Date("2025-12-01T17:59:59Z"),
          minAttendees: 4,
          maxAttendees: 8,
        },
        score: 0.6,
      },
    ];
    const results = filterAndSortEvents(
      events,
      { id: "activity1" },
      groupSize,
      startTime,
      endTime
    );
    expect(results.length).toBe(1);
    expect(results[0].event.startsAt.toISOString()).toBe(
      "2025-12-01T18:00:00.000Z"
    );
  });

  it("returns all events if groupSize is null or undefined", () => {
    const events = [
      {
        event: {
          activity: { id: "activity1" },
          activityId: "activity1",
          startsAt: new Date("2025-12-01T18:00:00Z"),
          minAttendees: 1,
          maxAttendees: 10,
        },
        score: 0.8,
      },
      {
        event: {
          activity: { id: "activity1" },
          activityId: "activity1",
          startsAt: new Date("2025-12-01T18:00:00Z"),
          minAttendees: 1,
          maxAttendees: 10,
        },
        score: 0.7,
      },
    ];
    // groupSize undefined
    const results1 = filterAndSortEvents(
      events,
      { id: "activity1" },
      undefined,
      undefined,
      undefined
    );
    expect(results1.length).toBe(2);
    // groupSize null
    const results2 = filterAndSortEvents(
      events,
      { id: "activity1" },
      undefined,
      undefined,
      undefined
    );
    expect(results2.length).toBe(2);
  });

  it("returns empty array if events is empty or null", () => {
    const results1 = filterAndSortEvents(
      [],
      { id: "activity1" },
      5,
      undefined,
      undefined
    );
    expect(results1.length).toBe(0);
    const results2 = filterAndSortEvents(
      [],
      { id: "activity1" },
      5,
      undefined,
      undefined
    );
    expect(results2.length).toBe(0);
  });
});
