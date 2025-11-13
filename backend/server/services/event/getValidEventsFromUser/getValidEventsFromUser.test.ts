import { Database } from "@/backend/server/prisma";
import { getValidEventsFromUser } from "./getValidEventsFromUser";

describe("getValidEventsFromUser tests", () => {
  let mockDB: jest.Mocked<Database>;

  beforeEach(() => {
    mockDB = {
      event: {
        findMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      userProfile: {
        findUnique: jest.fn(),
      },
    } as any as jest.Mocked<Database>;
  });

  it("filters out past events", async () => {
    const userId = "test-user-id";
    const now = new Date("2025-11-13T12:00:00Z");

    // Mock user data
    (mockDB.user.findUnique as jest.Mock).mockResolvedValue({
      id: userId,
      profile: {
        birthday: new Date("1990-01-01"),
      },
    });

    // Mock events: one past, one future
    const pastEvent = {
      id: "past-event",
      name: "Past Event",
      startsAt: new Date("2025-11-10T12:00:00Z"),
      endsAt: new Date("2025-11-10T14:00:00Z"),
      lowerAgeLimit: null,
      upperAgeLimit: null,
    };

    const futureEvent = {
      id: "future-event",
      name: "Future Event",
      startsAt: new Date("2025-11-15T12:00:00Z"),
      endsAt: new Date("2025-11-15T14:00:00Z"),
      lowerAgeLimit: null,
      upperAgeLimit: null,
    };

    (mockDB.event.findMany as jest.Mock).mockResolvedValue([
      pastEvent,
      futureEvent,
    ]);

    const validEvents = await getValidEventsFromUser(userId, mockDB, now);
    expect(validEvents).toBeDefined();
    expect(validEvents.length).toBe(1);
    expect(validEvents[0].id).toBe("future-event");
  });

  it("filters out events who's age range doesn't cover the user", async () => {
    const userId = "test-user-id";
    const now = new Date("2025-11-13T12:00:00Z");

    // User is 35 years old (born 1990-01-01)
    (mockDB.user.findUnique as jest.Mock).mockResolvedValue({
      id: userId,
      profile: {
        birthday: new Date("1990-01-01"),
      },
    });

    // Mock events with different age ranges
    const tooYoungEvent = {
      id: "too-young-event",
      name: "Teens Only Event",
      startsAt: new Date("2025-11-15T12:00:00Z"),
      endsAt: new Date("2025-11-15T14:00:00Z"),
      lowerAgeLimit: 13,
      upperAgeLimit: 19, // User is 35, too old
    };

    const tooOldEvent = {
      id: "too-old-event",
      name: "Seniors Only Event",
      startsAt: new Date("2025-11-15T12:00:00Z"),
      endsAt: new Date("2025-11-15T14:00:00Z"),
      lowerAgeLimit: 65, // User is 35, too young
      upperAgeLimit: null,
    };

    const validEvent = {
      id: "valid-event",
      name: "Adult Event",
      startsAt: new Date("2025-11-15T12:00:00Z"),
      endsAt: new Date("2025-11-15T14:00:00Z"),
      lowerAgeLimit: 21,
      upperAgeLimit: 50, // User is 35, fits
    };

    const noLimitEvent = {
      id: "no-limit-event",
      name: "All Ages Event",
      startsAt: new Date("2025-11-15T12:00:00Z"),
      endsAt: new Date("2025-11-15T14:00:00Z"),
      lowerAgeLimit: null,
      upperAgeLimit: null, // No age restrictions
    };

    (mockDB.event.findMany as jest.Mock).mockResolvedValue([
      tooYoungEvent,
      tooOldEvent,
      validEvent,
      noLimitEvent,
    ]);

    // TODO: Call getValidEventsFromUser(mockDB, userId, now)
    // Expect only validEvent and noLimitEvent to be returned
  });
});
