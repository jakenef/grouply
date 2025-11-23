import { adminProcedure } from "@/backend/server/trpc";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";

const client = new OpenAI();

const starterActivities = [
  {
    slug: "pickup-basketball",
    label: "Pickup Basketball",
    description:
      "Casual basketball games open to anyone who wants to play. Usually at local gyms or outdoor courts. Great for staying active, improving skills, and meeting new players.",
  },
  {
    slug: "hiking",
    label: "Hiking",
    description:
      "Exploring trails and mountain paths on foot in nature. Exercise, fresh air, and scenic views with friends or solo.",
  },
  {
    slug: "watch-scary-movies",
    label: "Watch Scary Movies",
    description:
      "Indoor movie night featuring horror and thriller films. Suspense, jump scares, and spooky storytelling in a cozy setting.",
  },
  {
    slug: "board-game-night",
    label: "Board Game Night",
    description:
      "Gather to play tabletop games from strategy to party favorites. Social, relaxed, and great for laughs with friends.",
  },
  {
    slug: "trail-running",
    label: "Trail Running",
    description:
      "Running on scenic natural trails through forests or canyons. Endurance exercise with nature views and fresh air.",
  },
  {
    slug: "painting-class",
    label: "Painting Class",
    description:
      "Guided art session covering techniques with acrylics, oils, or watercolors. Creative, mindful, and beginner friendly.",
  },
  {
    slug: "yoga-session",
    label: "Yoga Session",
    description:
      "Group or solo practice combining stretching, breathing, and mindfulness. Promotes flexibility, calmness, and well-being.",
  },
  {
    slug: "cooking-together",
    label: "Cooking Together",
    description:
      "Prepare and share a homemade meal as a group. Teamwork, creativity, and the joy of tasting dishes together.",
  },
  {
    slug: "volunteer-event",
    label: "Volunteer Event",
    description:
      "Community service like food drives, park cleanups, or mentoring. Meaningful way to connect and make a difference.",
  },
  {
    slug: "stargazing-night",
    label: "Stargazing Night",
    description:
      "Outdoor evening focused on watching stars and constellations. Peaceful, reflective, and best in dark open areas.",
  },
];

export const TRB_createActivities = adminProcedure.mutation(async ({ ctx }) => {
  try {
    const createdActivities = [];

    for (const base of starterActivities) {
      // ensure we have a non-empty description to embed
      const description =
        base.description?.trim() || `${base.label}: short activity description`;

      // 1) create the row first (vector column is Unsupported in Prisma)
      const created = await ctx.prisma.activity.upsert({
        where: { slug: base.slug },
        create: {
          slug: base.slug,
          label: base.label,
          description,
        },
        update: {
          label: base.label,
          description,
        },
      });

      // 2) generate embedding
      const embResp = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: description,
        encoding_format: "float",
      });
      const embedding = embResp.data[0].embedding;

      // 3) write embedding with raw SQL
      await ctx.prisma.$executeRawUnsafe(
        `UPDATE "Activity" SET embedding = $1::vector WHERE id = $2`,
        JSON.stringify(embedding),
        created.id
      );

      createdActivities.push(created);
    }

    return {
      success: true,
      count: createdActivities.length,
      activities: createdActivities.map((a) => ({
        id: a.id,
        slug: a.slug,
        label: a.label,
      })),
    };
  } catch (error) {
    console.error("Error creating activities:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create activities",
      cause: error,
    });
  }
});
