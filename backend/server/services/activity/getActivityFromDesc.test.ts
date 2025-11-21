import OpenAI from "openai";
import { prisma } from "../../prisma";
import { getActivityFromDesc } from "./getActivityFromDesc";

describe("getActivityFromDesc integration tests", () => {
  let hikingTimpActivityDesc = "hiking mount timp through the night";
  let hikingTimpActivityId: string;
  let frenchMovieActivityDesc =
    "watching french movies in black and white with the captions";
  let frenchMovieActivityId: string;
  let canyonTrailRunDesc = "running the canyon trail along a paved pathway";
  let canyonTrailActivityId: string;
  const openai = new OpenAI();

  beforeAll(async () => {
    const hikingActivity = await prisma.activity.create({
      data: {
        label: "Hiking Timp",
        slug: "hiking-timp-getActivityFromDescIntegrationTest",
        description: hikingTimpActivityDesc,
      },
    });
    hikingTimpActivityId = hikingActivity.id;

    const hikingActivityEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: hikingTimpActivityDesc,
    });
    const hikingActivityEmbedding =
      hikingActivityEmbeddingResponse.data[0].embedding;

    // Update with embedding using raw SQL
    await prisma.$executeRaw`
      UPDATE "Activity" 
      SET embedding = ${JSON.stringify(hikingActivityEmbedding)}::vector 
      WHERE id = ${hikingTimpActivityId}
    `;

    const movieNightActivity = await prisma.activity.create({
      data: {
        label: "Watch French Movies",
        slug: "watch-french-movies-getActivityFromDescIntegrationTest",
        description: frenchMovieActivityDesc,
      },
    });
    frenchMovieActivityId = movieNightActivity.id;

    const frenchMovieActivityEmbeddingResponse = await openai.embeddings.create(
      {
        model: "text-embedding-3-small",
        input: frenchMovieActivityDesc,
      }
    );
    const frenchMovieEmbedding =
      frenchMovieActivityEmbeddingResponse.data[0].embedding;

    // Update with embedding using raw SQL
    await prisma.$executeRaw`
      UPDATE "Activity" 
      SET embedding = ${JSON.stringify(frenchMovieEmbedding)}::vector 
      WHERE id = ${frenchMovieActivityId}
    `;

    const runningActivity = await prisma.activity.create({
      data: {
        label: "Run Canyon Trail",
        slug: "run-canyon-trail-getActivityFromDescIntegrationTest",
        description: canyonTrailRunDesc,
      },
    });
    canyonTrailActivityId = runningActivity.id;

    const canyonTrailEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: canyonTrailRunDesc,
    });
    const canyonTrailEmbedding = canyonTrailEmbeddingResponse.data[0].embedding;

    // Update with embedding using raw SQL
    await prisma.$executeRaw`
      UPDATE "Activity" 
      SET embedding = ${JSON.stringify(canyonTrailEmbedding)}::vector 
      WHERE id = ${canyonTrailActivityId}
    `;
  }, 15000);

  afterAll(async () => {
    await prisma.activity.deleteMany({
      where: {
        id: {
          in: [
            canyonTrailActivityId,
            frenchMovieActivityId,
            hikingTimpActivityId,
          ],
        },
      },
    });
  });

  it("can pick hiking correctly between wildly different activities and slightly different (hiking timp vs french movie night vs running canyon trail)", async () => {
    const userDesc = "hiking in nature";
    const foundActivity = await getActivityFromDesc(userDesc);

    expect(foundActivity).not.toBeNull();
    expect(foundActivity!.id).toBe(hikingTimpActivityId);
  });

  it("can pick trail running correctly between wildly different activities and slightly different (hiking timp vs french movie night vs running canyon trail)", async () => {
    const userDesc = "running outside";
    const foundActivity = await getActivityFromDesc(userDesc);

    expect(foundActivity).not.toBeNull();
    expect(foundActivity!.id).toBe(canyonTrailActivityId);
  });

  it("can tell when an activity doesn't exist", async () => {
    const userDesc = "tightrope walking while juggling";
    const foundActivity = await getActivityFromDesc(userDesc);

    expect(foundActivity).toBeNull();
  });
});
