import { adminProcedure } from "@/backend/server/trpc";
import { faker } from "@faker-js/faker";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const starterInterests = [
  // 🏃‍♂️ Fitness & Sports
  { slug: "fitness", label: "Fitness" },
  { slug: "working-out", label: "Working Out" },
  { slug: "running", label: "Running" },
  { slug: "walking", label: "Walking" },
  { slug: "hiking", label: "Hiking" },
  { slug: "trail-running", label: "Trail Running" },
  { slug: "cycling", label: "Cycling" },
  { slug: "yoga", label: "Yoga" },
  { slug: "pilates", label: "Pilates" },
  { slug: "weightlifting", label: "Weightlifting" },
  { slug: "basketball", label: "Basketball" },
  { slug: "football", label: "Football" },
  { slug: "soccer", label: "Soccer" },
  { slug: "volleyball", label: "Volleyball" },
  { slug: "tennis", label: "Tennis" },
  { slug: "pickleball", label: "Pickleball" },
  { slug: "golf", label: "Golf" },
  { slug: "swimming", label: "Swimming" },
  { slug: "rock-climbing", label: "Rock Climbing" },
  { slug: "martial-arts", label: "Martial Arts" },

  // 🌲 Outdoors & Adventure
  { slug: "outdoors", label: "Outdoors" },
  { slug: "camping", label: "Camping" },
  { slug: "backpacking", label: "Backpacking" },
  { slug: "stargazing", label: "Stargazing" },
  { slug: "nature", label: "Nature" },
  { slug: "road-trips", label: "Road Trips" },
  { slug: "travel", label: "Travel" },
  { slug: "adventure", label: "Adventure" },
  { slug: "national-parks", label: "National Parks" },
  { slug: "beach", label: "Beach" },

  // 🎮 Games & Play
  { slug: "gaming", label: "Gaming" },
  { slug: "video-games", label: "Video Games" },
  { slug: "board-games", label: "Board Games" },
  { slug: "card-games", label: "Card Games" },
  { slug: "party-games", label: "Party Games" },
  { slug: "puzzles", label: "Puzzles" },
  { slug: "escape-rooms", label: "Escape Rooms" },
  { slug: "trivia", label: "Trivia" },
  { slug: "chess", label: "Chess" },

  // 🎬 Media & Entertainment
  { slug: "movies", label: "Movies" },
  { slug: "film", label: "Film" },
  { slug: "tv-shows", label: "TV Shows" },
  { slug: "documentaries", label: "Documentaries" },
  { slug: "sports-fandom", label: "Sports Fandom" },
  { slug: "theater", label: "Theater" },
  { slug: "comedy", label: "Comedy" },
  { slug: "stand-up-comedy", label: "Stand-Up Comedy" },
  { slug: "live-music", label: "Live Music" },
  { slug: "concerts", label: "Concerts" },

  // 🎵 Music
  { slug: "music", label: "Music" },
  { slug: "playing-music", label: "Playing Music" },
  { slug: "singing", label: "Singing" },
  { slug: "karaoke", label: "Karaoke" },
  { slug: "music-production", label: "Music Production" },
  { slug: "songwriting", label: "Songwriting" },
  { slug: "vinyl", label: "Vinyl Records" },

  // 🎨 Creative & Artistic
  { slug: "art", label: "Art" },
  { slug: "painting", label: "Painting" },
  { slug: "drawing", label: "Drawing" },
  { slug: "illustration", label: "Illustration" },
  { slug: "design", label: "Design" },
  { slug: "photography", label: "Photography" },
  { slug: "videography", label: "Videography" },
  { slug: "crafts", label: "Crafts" },
  { slug: "diy", label: "DIY Projects" },
  { slug: "writing", label: "Writing" },
  { slug: "creative-writing", label: "Creative Writing" },

  // 📚 Learning & Growth
  { slug: "reading", label: "Reading" },
  { slug: "books", label: "Books" },
  { slug: "book-clubs", label: "Book Clubs" },
  { slug: "learning", label: "Learning" },
  { slug: "self-improvement", label: "Self Improvement" },
  { slug: "personal-growth", label: "Personal Growth" },
  { slug: "education", label: "Education" },
  { slug: "podcasts", label: "Podcasts" },
  { slug: "history", label: "History" },
  { slug: "philosophy", label: "Philosophy" },
  { slug: "psychology", label: "Psychology" },

  // 🍳 Food & Drink
  { slug: "food", label: "Food" },
  { slug: "cooking", label: "Cooking" },
  { slug: "baking", label: "Baking" },
  { slug: "coffee", label: "Coffee" },
  { slug: "tea", label: "Tea" },
  { slug: "wine", label: "Wine" },
  { slug: "craft-beer", label: "Craft Beer" },
  { slug: "restaurants", label: "Restaurants" },
  { slug: "brunch", label: "Brunch" },
  { slug: "food-exploring", label: "Trying New Food" },

  // 🧘 Wellness & Lifestyle
  { slug: "wellness", label: "Wellness" },
  { slug: "mental-health", label: "Mental Health" },
  { slug: "meditation", label: "Meditation" },
  { slug: "mindfulness", label: "Mindfulness" },
  { slug: "self-care", label: "Self Care" },
  { slug: "journaling", label: "Journaling" },
  { slug: "sleep", label: "Sleep" },
  { slug: "minimalism", label: "Minimalism" },

  // 🤝 Social & Community
  { slug: "friendship", label: "Friendship" },
  { slug: "meeting-new-people", label: "Meeting New People" },
  { slug: "community", label: "Community" },
  { slug: "volunteering", label: "Volunteering" },
  { slug: "mentorship", label: "Mentorship" },
  { slug: "networking", label: "Networking" },
  { slug: "leadership", label: "Leadership" },

  // 💼 Work & Life
  { slug: "career", label: "Career" },
  { slug: "entrepreneurship", label: "Entrepreneurship" },
  { slug: "startups", label: "Startups" },
  { slug: "technology", label: "Technology" },
  { slug: "software", label: "Software" },
  { slug: "design-thinking", label: "Design Thinking" },
  { slug: "finance", label: "Finance" },
  { slug: "investing", label: "Investing" },

  // 🌍 Values & Curiosity
  { slug: "sustainability", label: "Sustainability" },
  { slug: "environment", label: "Environment" },
  { slug: "travel-culture", label: "Culture" },
  { slug: "languages", label: "Languages" },
  { slug: "faith", label: "Faith" },
  { slug: "spirituality", label: "Spirituality" },
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
