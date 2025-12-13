import { Prisma } from "@/backend/generated/prisma";
import OpenAI from "openai";
import { prisma } from "../../prisma";

/**
 * Finds the most similar activity from the database based on a text description.
 *
 * This function generates a semantic embedding for the provided description using OpenAI's
 * text-embedding-3-small model, then performs a vector similarity search against stored
 * activities in the database using cosine similarity.
 *
 * @param desc - The text description to search for matching activities
 * @returns A promise that resolves to an object containing the matched activity's id, name,
 *          description, and similarity score if a match above the minimum threshold is found,
 *          or null if no suitable match exists
 *
 * @remarks
 * - Uses a minimum similarity threshold of 0.45
 * - Returns only the single best match (k=1)
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
export async function getActivityFromDesc(desc: string) {
  // generate semantic embedding for desc
  if (desc.trim().length == 0) {
    return null;
  }
  const openai = new OpenAI();
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: desc,
    encoding_format: "float",
  });

  const minSimilarity = 0.45;
  const k = 1;

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
    `
  );

  const best = results[0];
  console.log("input: ", desc, "closest activity: ", best);
  if (best && best.similarity > minSimilarity) {
    return best;
  }
  return null;
}
