import { adminProcedure } from "@/backend/server/trpc";
import { faker } from "@faker-js/faker";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const starterTraits = [
  {
    slug: "introversion",
    label: "Introversion",
    desc: "Preference for quiet, low-stimulation environments and smaller social gatherings.",
  },
  {
    slug: "extroversion",
    label: "Extroversion",
    desc: "Preference for social interaction, high-energy environments, and larger groups.",
  },
  {
    slug: "risk-tolerance",
    label: "Risk Tolerance",
    desc: "Comfort level with uncertainty, adventure, and trying new experiences.",
  },
  {
    slug: "spontaneity",
    label: "Spontaneity",
    desc: "Preference for impromptu plans and flexibility over rigid schedules.",
  },
  {
    slug: "structure-preference",
    label: "Structure Preference",
    desc: "Preference for organized, planned activities with clear expectations.",
  },
  {
    slug: "competitiveness",
    label: "Competitiveness",
    desc: "Drive to win and excel in competitive activities and games.",
  },
  {
    slug: "creativity",
    label: "Creativity",
    desc: "Interest in artistic expression, innovation, and imaginative pursuits.",
  },
  {
    slug: "physical-activity",
    label: "Physical Activity",
    desc: "Preference for active, sports-oriented, and physically demanding activities.",
  },
  {
    slug: "intellectual-curiosity",
    label: "Intellectual Curiosity",
    desc: "Interest in learning, discussions, and mentally stimulating activities.",
  },
  {
    slug: "sociability",
    label: "Sociability",
    desc: "Enjoyment of meeting new people and building social connections.",
  },
];

export const TRB_createTraits = adminProcedure
  .input(
    z.object({
      numTraits: z.number().min(1).max(50).optional().default(10),
      useStarters: z.boolean().optional().default(true),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const createdTraits = [];

      // Create starter traits if requested
      if (input.useStarters) {
        for (const trait of starterTraits) {
          const created = await ctx.prisma.trait.upsert({
            where: { slug: trait.slug },
            create: {
              id: "TRB_" + uuidv4(),
              slug: trait.slug,
              label: trait.label,
              desc: trait.desc,
              isApproved: true,
            },
            update: {
              label: trait.label,
              desc: trait.desc,
              isApproved: true,
            },
          });
          createdTraits.push(created);
        }
      }

      // Create additional random traits
      const randomCount = input.useStarters
        ? Math.max(0, input.numTraits - starterTraits.length)
        : input.numTraits;

      for (let i = 0; i < randomCount; i++) {
        const slug = faker.helpers.slugify(
          faker.word.adjective() + "-" + faker.word.noun()
        );
        const label = faker.word
          .words({ count: { min: 1, max: 3 } })
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        const desc = faker.lorem.sentence();

        const created = await ctx.prisma.trait.create({
          data: {
            id: "TRB_" + uuidv4(),
            slug: `trb-${slug}-${i}`,
            label,
            desc,
            isApproved: faker.datatype.boolean(),
          },
        });

        createdTraits.push(created);
      }

      return {
        success: true,
        count: createdTraits.length,
        traits: createdTraits.map((t) => ({
          id: t.id,
          slug: t.slug,
          label: t.label,
          isApproved: t.isApproved,
        })),
      };
    } catch (error) {
      console.error("Error creating traits:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create traits",
        cause: error,
      });
    }
  });
