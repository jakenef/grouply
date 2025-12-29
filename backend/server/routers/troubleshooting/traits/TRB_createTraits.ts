import { adminProcedure } from "@/backend/server/trpc";
import { faker } from "@faker-js/faker";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const starterTraits = [
  // 🌱 Social Energy
  {
    slug: "introverted",
    label: "Introverted",
    desc: "Tends to prefer quieter settings, smaller groups, and time to recharge alone.",
  },
  {
    slug: "extroverted",
    label: "Extroverted",
    desc: "Feels energized by being around people and enjoys lively, social environments.",
  },
  {
    slug: "social",
    label: "Social",
    desc: "Enjoys spending time with others and being part of group activities.",
  },
  {
    slug: "reserved",
    label: "Reserved",
    desc: "More quiet or low-key in group settings, especially around new people.",
  },
  {
    slug: "outgoing",
    label: "Outgoing",
    desc: "Comfortable starting conversations and engaging with people easily.",
  },

  // 🗓 Planning & Structure
  {
    slug: "planner",
    label: "Planner",
    desc: "Likes having plans set in advance and knowing what to expect.",
  },
  {
    slug: "go-with-the-flow",
    label: "Go With the Flow",
    desc: "Prefers flexible plans and is comfortable adjusting as things change.",
  },
  {
    slug: "organized",
    label: "Organized",
    desc: "Enjoys keeping things structured, tidy, and well thought out.",
  },
  {
    slug: "easygoing",
    label: "Easygoing",
    desc: "Relaxed attitude toward plans, people, and unexpected changes.",
  },
  {
    slug: "routine-oriented",
    label: "Routine-Oriented",
    desc: "Likes consistent habits and familiar rhythms in daily life.",
  },

  // 🎉 Group Style
  {
    slug: "group-leader",
    label: "Group Leader",
    desc: "Often takes initiative in planning, organizing, or guiding group activities.",
  },
  {
    slug: "follower",
    label: "Happy to Follow",
    desc: "Prefers joining plans rather than organizing or leading them.",
  },
  {
    slug: "team-player",
    label: "Team Player",
    desc: "Enjoys collaborating and working toward shared goals with others.",
  },
  {
    slug: "independent",
    label: "Independent",
    desc: "Comfortable doing things solo and making decisions on their own.",
  },
  {
    slug: "supportive",
    label: "Supportive",
    desc: "Naturally encouraging and attentive to others’ needs and feelings.",
  },

  // 🎮 Energy & Engagement
  {
    slug: "competitive",
    label: "Competitive",
    desc: "Enjoys competition and pushing to win or improve performance.",
  },
  {
    slug: "laid-back",
    label: "Laid Back",
    desc: "Prefers relaxed environments and low-pressure situations.",
  },
  {
    slug: "energetic",
    label: "Energetic",
    desc: "Brings enthusiasm and momentum to activities and group settings.",
  },
  {
    slug: "calm",
    label: "Calm",
    desc: "Steady and composed, even in busy or stressful situations.",
  },
  {
    slug: "focused",
    label: "Focused",
    desc: "Able to concentrate deeply and stay engaged with tasks or conversations.",
  },

  // 🎨 Interests & Expression
  {
    slug: "creative",
    label: "Creative",
    desc: "Enjoys expressing ideas through art, writing, design, or imaginative thinking.",
  },
  {
    slug: "analytical",
    label: "Analytical",
    desc: "Likes thinking through problems logically and understanding how things work.",
  },
  {
    slug: "curious",
    label: "Curious",
    desc: "Interested in learning new things and asking questions about the world.",
  },
  {
    slug: "thoughtful",
    label: "Thoughtful",
    desc: "Reflective and considerate in conversations and decisions.",
  },
  {
    slug: "opinionated",
    label: "Opinionated",
    desc: "Comfortable sharing viewpoints and having strong preferences.",
  },

  // 🏃 Activity Level
  {
    slug: "active",
    label: "Active",
    desc: "Enjoys moving, exercising, or staying physically engaged.",
  },
  {
    slug: "low-key",
    label: "Low Key",
    desc: "Prefers relaxed activities over high-energy or intense ones.",
  },
  {
    slug: "outdoorsy",
    label: "Outdoorsy",
    desc: "Enjoys spending time outside in nature or open-air environments.",
  },
  {
    slug: "indoorsy",
    label: "Indoorsy",
    desc: "Prefers indoor activities and comfortable, familiar spaces.",
  },

  // 🤝 Social Preferences
  {
    slug: "people-person",
    label: "People Person",
    desc: "Genuinely enjoys interacting with others and building relationships.",
  },
  {
    slug: "small-groups",
    label: "Prefers Small Groups",
    desc: "Feels most comfortable socializing in smaller, more intimate settings.",
  },
  {
    slug: "large-groups",
    label: "Enjoys Large Groups",
    desc: "Likes being part of big gatherings, parties, or group events.",
  },
  {
    slug: "one-on-one",
    label: "One-on-One Oriented",
    desc: "Prefers deeper conversations with individuals over group discussions.",
  },

  // 🧠 Mindset
  {
    slug: "open-minded",
    label: "Open-Minded",
    desc: "Welcoming of different ideas, perspectives, and experiences.",
  },
  {
    slug: "practical",
    label: "Practical",
    desc: "Focuses on what is useful, realistic, and effective.",
  },
  {
    slug: "optimistic",
    label: "Optimistic",
    desc: "Generally positive outlook and hopeful attitude.",
  },
  {
    slug: "realistic",
    label: "Realistic",
    desc: "Grounded and clear-eyed about expectations and outcomes.",
  },

  // 💬 Communication Style
  {
    slug: "talkative",
    label: "Talkative",
    desc: "Enjoys conversation and tends to speak freely in groups.",
  },
  {
    slug: "good-listener",
    label: "Good Listener",
    desc: "Attentive to what others say and values meaningful dialogue.",
  },
  {
    slug: "direct",
    label: "Direct",
    desc: "Communicates clearly and straightforwardly.",
  },
  {
    slug: "easy-to-talk-to",
    label: "Easy to Talk To",
    desc: "Approachable and makes others feel comfortable opening up.",
  },

  // 🌟 Lifestyle
  {
    slug: "morning-person",
    label: "Morning Person",
    desc: "Feels most energized earlier in the day.",
  },
  {
    slug: "night-owl",
    label: "Night Owl",
    desc: "Feels most energized later in the evening or at night.",
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
