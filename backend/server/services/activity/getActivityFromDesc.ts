import { Prisma } from "@/backend/generated/prisma";
import { openai } from "../../openai";
import { prisma } from "../../prisma";

/**
 * Finds the most similar activity from the database based on a text description.
 *
 * This function generates a semantic embedding for the provided description using OpenAI's
 * text-embedding-3-small model, then performs a vector similarity search against stored
 * activities in the database using cosine similarity.
 *
 * @param desc - The text description to search for matching activities
 * @returns A promise that resolves to an array containing all of the matched activity's id, name,
 *          description, and similarity score if a match above the minimum threshold is found,
 *          or empty array if none close enough are found
 *
 * @remarks
 * - Uses a minimum similarity threshold of 0.3
 * - Returns only the single best match (k=1) unless specified in parameter
 * - Requires activities in the database to have valid embedding vectors
 * - Similarity score ranges from 0 to 1, where 1 is identical
 *
 * @example
 * ```typescript
 * const result = await getActivityFromDesc("playing basketball with friends");
 * if (result) {
 *   console.log(`Found activity: ${result.name} with ${result.similarity} similarity`);
 * }
 * ```
 */
export async function getActivitiesFromDesc(
  desc: string,
  returnClosestMatch: boolean = false,
) {
  // generate semantic embedding for desc
  if (desc.trim().length == 0) {
    return [];
  }
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: desc,
    encoding_format: "float",
  });

  const minSimilarity = 0.3;
  const k = 5;

  const embedding = response.data[0].embedding;

  // compare against database, find best match using cosine similarity

  const queryVector = `[${embedding.join(",")}]`;

  const results = await prisma.$queryRaw<
    { id: string; name: string; desc: string; similarity: number }[]
  >(
    Prisma.sql`
      SELECT
        id,
        label as name,
        description as "desc",
        1 - (embedding <=> ${queryVector}::vector) AS similarity
      FROM "public"."Activity"
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${queryVector}::vector
      LIMIT ${k};
    `,
  );

  const topActivities = results.filter(
    (activity) => returnClosestMatch || activity.similarity >= minSimilarity,
  );

  return topActivities;
}
