import { adminProcedure } from "@/backend/server/trpc";
import { faker } from "@faker-js/faker";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const starterInterests = [
  {
    slug: "hiking",
    label: "Hiking",
  },
  {
    slug: "basketball",
    label: "Basketball",
  },
  {
    slug: "yoga",
    label: "Yoga",
  },
  {
    slug: "cooking",
    label: "Cooking",
  },
  {
    slug: "painting",
    label: "Painting",
  },
  {
    slug: "board-games",
    label: "Board Games",
  },
  {
    slug: "photography",
    label: "Photography",
  },
  {
    slug: "running",
    label: "Running",
  },
  {
    slug: "rock-climbing",
    label: "Rock Climbing",
  },
  {
    slug: "cycling",
    label: "Cycling",
  },
  {
    slug: "tennis",
    label: "Tennis",
  },
  {
    slug: "reading",
    label: "Reading",
  },
  {
    slug: "gaming",
    label: "Gaming",
  },
  {
    slug: "dancing",
    label: "Dancing",
  },
  {
    slug: "music",
    label: "Music",
  },
  {
    slug: "movies",
    label: "Movies",
  },
  {
    slug: "volunteering",
    label: "Volunteering",
  },
  {
    slug: "coffee",
    label: "Coffee",
  },
  {
    slug: "travel",
    label: "Travel",
  },
  {
    slug: "food",
    label: "Food",
  },
];

export const TRB_createInterests = adminProcedure
  .input(
    z.object({
      numInterests: z.number().min(1).max(50).optional().default(20),
      useStarters: z.boolean().optional().default(true),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const createdInterests = [];

      // Create starter interests if requested
      if (input.useStarters) {
        for (const interest of starterInterests) {
          const created = await ctx.prisma.interest.upsert({
            where: { slug: interest.slug },
            create: {
              id: "TRB_" + uuidv4(),
              slug: interest.slug,
              label: interest.label,
              isApproved: true,
            },
            update: {
              label: interest.label,
              isApproved: true,
            },
          });
          createdInterests.push(created);
        }
      }

      // Create additional random interests
      const randomCount = input.useStarters
        ? Math.max(0, input.numInterests - starterInterests.length)
        : input.numInterests;

      for (let i = 0; i < randomCount; i++) {
        const slug = faker.helpers.slugify(
          faker.word.noun() + "-" + faker.word.verb()
        );
        const label = faker.word
          .words({ count: { min: 1, max: 2 } })
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        const created = await ctx.prisma.interest.create({
          data: {
            id: "TRB_" + uuidv4(),
            slug: `trb-${slug}-${i}`,
            label,
            isApproved: faker.datatype.boolean(),
          },
        });

        createdInterests.push(created);
      }

      return {
        success: true,
        count: createdInterests.length,
        interests: createdInterests.map((i) => ({
          id: i.id,
          slug: i.slug,
          label: i.label,
          isApproved: i.isApproved,
        })),
      };
    } catch (error) {
      console.error("Error creating interests:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create interests",
        cause: error,
      });
    }
  });
