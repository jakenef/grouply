import { Prisma } from "@/backend/generated/prisma";
import OpenAI from "openai";
import { prisma } from "../../prisma";

// takes in a desc and a name maybe and uses text embedding vector math to find related activities
export async function getActivityFromDesc(desc: string) {
  // generate semantic embedding for desc
  const openai = new OpenAI();
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: desc,
    encoding_format: "float",
  });

  const minSimilarity = 0.8;
  const k = 1;

  const embedding = response.data[0].embedding;

  // compare against database, find best match using cosine similarity

  const queryVector = `[${embedding.join(",")}]`;

  const where: Prisma.Sql[] = [
    Prisma.sql`embedding IS NOT NULL`,
    Prisma.sql`(embedding <=> ${queryVector}::vector) < (1 - ${minSimilarity})`,
  ];

  const whereClause = Prisma.sql`${Prisma.join(where, " AND ")}`;

  const results = await prisma.$queryRaw<
    { id: string; name: string; desc: string; similarity: number }[]
  >(
    Prisma.sql`
      SELECT
        id,
        name,
        desc,
        1 - (embedding <=> ${queryVector}::vector) AS similarity
      FROM "public"."Activity"
      WHERE ${whereClause}
      ORDER BY embedding <=> ${queryVector}::vector
      LIMIT ${k};
    `
  );

  if (results) {
    return results;
  } else {
    return null;
  }
}
