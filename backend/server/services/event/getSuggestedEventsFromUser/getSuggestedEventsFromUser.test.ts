import type { Database } from "@/backend/server/prisma";

interface Event {
  id: string;
  title: string;
  location: string;
  dateTime: Date;
  thumbnailUrl: string;
  maxParticipants: number;
  currentParticipants: number;
  snapshot: Snapshot;
}

interface Snapshot {
  eventId: string;
  interestSlugs: string[];
  traitScores: string;
}

describe("getSuggestedEventsFromUser", () => {
  let mockDB: jest.Mocked<Database>;
  const databaseEvents = [];

  beforeEach(() => {
    mockDB = {
      event: {
        findMany: jest.fn(),
      },
    } as any as jest.Mocked<Database>;
  });

  it("should return an ordered array of suggested events", async () => {});
});
