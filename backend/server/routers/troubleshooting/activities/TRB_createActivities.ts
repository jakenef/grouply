import { adminProcedure } from "@/backend/server/trpc";
import { TRPCError } from "@trpc/server";
import { openai } from "../../../openai";

const starterActivities = [
  // 🎬 Entertainment & Media
  {
    slug: "watch-movies",
    label: "Watch Movies",
    description:
      "Watching one or more movies together in a shared setting such as a home, apartment, theater, or outdoor space. Can include casual viewing, themed movie nights, or relaxed social hangouts focused on entertainment, conversation, and shared reactions.",
  },
  {
    slug: "watch-tv-shows",
    label: "Watch TV Shows",
    description:
      "Watching television shows or streaming series together, including single episodes or binge sessions. Often casual and recurring, centered around shared interests, discussion, and spending low-pressure time together.",
  },
  {
    slug: "watch-sports",
    label: "Watch Sports",
    description:
      "Watching live or recorded sporting events together at home, bars, or public venues. Focused on shared excitement, competition, cheering, and social interaction around a game or match.",
  },
  {
    slug: "karaoke",
    label: "Karaoke",
    description:
      "Singing songs individually or in groups using karaoke equipment or apps. Emphasizes fun, self-expression, humor, and social bonding in a lively or supportive environment.",
  },
  {
    slug: "open-mic-night",
    label: "Open Mic Night",
    description:
      "Attending or hosting an event where people share performances such as music, comedy, poetry, or storytelling. Focused on creativity, audience engagement, and community support.",
  },

  // 🎮 Games
  {
    slug: "video-games",
    label: "Video Games",
    description:
      "Playing video games together either locally or online. Can include competitive, cooperative, or casual gameplay, and often serves as a relaxed social hangout.",
  },
  {
    slug: "board-games",
    label: "Board Games",
    description:
      "Playing tabletop board games together, ranging from strategic games to casual party games. Encourages conversation, friendly competition, and group interaction.",
  },
  {
    slug: "card-games",
    label: "Card Games",
    description:
      "Playing card-based games such as classics or modern card games in a social setting. Easy to organize and suited for relaxed group interaction.",
  },
  {
    slug: "party-games",
    label: "Party Games",
    description:
      "Playing lighthearted group games designed for laughs, movement, or social interaction. Often fast-paced and accessible to a wide range of people.",
  },
  {
    slug: "escape-room",
    label: "Escape Room",
    description:
      "Participating in a puzzle-based challenge where a group works together to solve clues and complete objectives within a time limit. Emphasizes teamwork and problem-solving.",
  },
  {
    slug: "trivia-night",
    label: "Trivia Night",
    description:
      "Answering trivia questions in teams or groups, often at bars, homes, or events. Combines knowledge, friendly competition, and social interaction.",
  },

  // 🏀 Sports & Fitness
  {
    slug: "basketball",
    label: "Basketball",
    description:
      "Playing basketball recreationally or competitively at gyms, courts, or parks. Focused on physical activity, teamwork, and friendly competition.",
  },
  {
    slug: "pickup-basketball",
    label: "Pickup Basketball",
    description:
      "Casual, informal basketball games where players join on the spot. Emphasizes accessibility, exercise, and spontaneous social play.",
  },
  {
    slug: "football",
    label: "Football",
    description:
      "Playing football casually or in organized settings. Can include flag or touch formats and focuses on teamwork and physical activity.",
  },
  {
    slug: "soccer",
    label: "Soccer",
    description:
      "Playing soccer recreationally with friends or organized groups. Emphasizes endurance, teamwork, and outdoor activity.",
  },
  {
    slug: "volleyball",
    label: "Volleyball",
    description:
      "Playing volleyball indoors or outdoors in casual or competitive formats. Social and active, often played at parks or beaches.",
  },
  {
    slug: "pickleball",
    label: "Pickleball",
    description:
      "Playing pickleball, a paddle sport combining elements of tennis and ping pong. Popular for mixed skill levels and social play.",
  },
  {
    slug: "running",
    label: "Running",
    description:
      "Running individually or in groups for fitness, training, or enjoyment. Can include casual jogs or structured workouts.",
  },
  {
    slug: "gym-workout",
    label: "Gym Workout",
    description:
      "Exercising at a gym using weights, machines, or cardio equipment. May be solo or social, structured or casual.",
  },
  {
    slug: "yoga",
    label: "Yoga",
    description:
      "Practicing yoga through guided or independent sessions focused on flexibility, strength, breathing, and mindfulness.",
  },

  // 🌲 Outdoor & Nature
  {
    slug: "hiking",
    label: "Hiking",
    description:
      "Walking or climbing along trails in natural areas such as mountains, forests, or parks. Combines physical activity, scenery, and social time.",
  },
  {
    slug: "camping",
    label: "Camping",
    description:
      "Spending time outdoors overnight in tents or cabins. Often includes campfires, cooking, hiking, and unplugged social interaction.",
  },
  {
    slug: "stargazing",
    label: "Stargazing",
    description:
      "Observing stars, planets, or constellations in dark outdoor locations. Calm, reflective, and often paired with conversation.",
  },
  {
    slug: "picnic",
    label: "Picnic",
    description:
      "Eating a meal outdoors in a park or scenic location. Casual, social, and relaxed.",
  },
  {
    slug: "walk",
    label: "Walk",
    description:
      "Casual walking together for conversation, relaxation, or light exercise. Low commitment and easy to organize.",
  },

  // 🍳 Food & Drink
  {
    slug: "cooking",
    label: "Cooking",
    description:
      "Preparing meals together as a group. Collaborative, creative, and centered around sharing food.",
  },
  {
    slug: "baking",
    label: "Baking",
    description:
      "Making desserts or baked goods together in a shared kitchen. Creative and often relaxed.",
  },
  {
    slug: "dinner",
    label: "Dinner",
    description:
      "Sharing an evening meal together at home or at a restaurant. Social and conversation-focused.",
  },
  {
    slug: "brunch",
    label: "Brunch",
    description:
      "Meeting for a late-morning or early-afternoon meal that blends breakfast and lunch. Casual and social.",
  },
  {
    slug: "coffee-meetup",
    label: "Coffee Meetup",
    description:
      "Meeting at a coffee shop or café to talk, work, or relax together. Low-pressure and commonly used for casual socializing or one-on-one conversations.",
  },
  {
    slug: "happy-hour",
    label: "Happy Hour / Drinks",
    description:
      "Meeting for drinks such as beer, cocktails, or wine, often at bars or restaurants. Social, relaxed, and commonly after work or in the evening.",
  },
  {
    slug: "wine-tasting",
    label: "Wine Tasting",
    description:
      "Sampling and discussing different wines in a guided or casual setting. Often social, conversational, and focused on shared experience rather than drinking quantity.",
  },

  // 🎵 Live Experiences
  {
    slug: "live-music",
    label: "Live Music",
    description:
      "Attending a live music performance such as a concert, band show, open mic, or acoustic set. Can take place at venues, bars, outdoor stages, festivals, or house shows, and focuses on enjoying music together.",
  },

  // 🎨 Creative & Learning
  {
    slug: "painting",
    label: "Painting",
    description:
      "Creating artwork using paint in a guided class or casual group setting. Focused on creativity and relaxation.",
  },
  {
    slug: "crafts",
    label: "Crafts",
    description:
      "Hands-on creative activities such as DIY projects, handmade goods, or artistic experiments.",
  },
  {
    slug: "writing",
    label: "Writing",
    description:
      "Writing creatively or collaboratively, such as journaling, storytelling, or workshops.",
  },
  {
    slug: "photography",
    label: "Photography",
    description:
      "Taking photos together for practice, exploration, or creative projects.",
  },
  {
    slug: "book-club",
    label: "Book Club",
    description:
      "Reading and discussing books as a group, often recurring and discussion-focused.",
  },
  {
    slug: "study-session",
    label: "Study Session",
    description:
      "Studying or working on academic material together in a shared space. Focused on productivity with social accountability.",
  },

  // 🤝 Social & Community
  {
    slug: "hangout",
    label: "Hangout",
    description:
      "Spending time together casually without a fixed agenda. Flexible, low-pressure, and social.",
  },
  {
    slug: "party",
    label: "Party",
    description:
      "A social gathering focused on celebration, fun, music, and group interaction.",
  },
  {
    slug: "volunteering",
    label: "Volunteering",
    description:
      "Participating in community service or charitable activities together. Purpose-driven and social.",
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
      const embResp = await openai.embeddings.create({
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
