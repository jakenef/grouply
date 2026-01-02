import OpenAI from "openai";
import { prisma } from "../../prisma";
import { getActivityFromDesc } from "./getActivityFromDesc";

describe("getActivityFromDesc integration tests", () => {
  let hikingTimpActivityDesc =
    "An adventurous overnight hike up Mount Timpanogos, following steep trails through forests and rocky ridges to reach a breathtaking summit view at sunrise. Ideal for nature lovers seeking a challenging mountain experience with friends under the stars.";
  let hikingTimpActivityId: string;
  let frenchMovieActivityDesc =
    "A cozy movie night focused on watching classic French films, often in black and white, with English subtitles. Perfect for people who love international cinema, quiet evenings, and cultural experiences centered around storytelling and aesthetics.";
  let frenchMovieActivityId: string;
  let canyonTrailRunDesc =
    "A refreshing run along the scenic canyon trail, following a smooth, paved path that winds through trees and streams. Great for runners who enjoy morning exercise, nature views, and fresh canyon air without technical terrain.";
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
    const userDesc =
      "hiking through mountain trails at night to reach a scenic sunrise view at the summit";
    const foundActivity = await getActivityFromDesc(userDesc);

    expect(foundActivity).not.toBeNull();
    expect(foundActivity!.id).toBe(hikingTimpActivityId);
  });

  it("can pick hiking correctly given a short desc", async () => {
    const userDesc = "hiking timp";
    const foundActivity = await getActivityFromDesc(userDesc);

    expect(foundActivity).not.toBeNull();
    expect(foundActivity!.id).toBe(hikingTimpActivityId);
  });

  it("can pick trail running correctly between wildly different activities and slightly different (hiking timp vs french movie night vs running canyon trail)", async () => {
    const userDesc =
      "running along a paved canyon trail surrounded by trees and streams";
    const foundActivity = await getActivityFromDesc(userDesc);

    expect(foundActivity).not.toBeNull();
    expect(foundActivity!.id).toBe(canyonTrailActivityId);
  });

  it("can tell when an activity doesn't exist", async () => {
    const userDesc =
      "balancing on a tightrope or juggling while walking across it";
    const foundActivity = await getActivityFromDesc(userDesc);

    expect(foundActivity).toBeNull();
  });

  // it("can tell when an activity isn't close enough", async () => {
  //   const userDesc = "watch stupid comedy movies with people";
  //   const foundActivity = await getActivityFromDesc(userDesc);

  //   expect(foundActivity).toBeNull();
  // });

  it("always returns something when closest match is turned on", async () => {
    const userDesc =
      "balancing on a tightrope or juggling while walking across it";
    const foundActivity = await getActivityFromDesc(userDesc, true);

    expect(foundActivity).toBeDefined();
  });
});
