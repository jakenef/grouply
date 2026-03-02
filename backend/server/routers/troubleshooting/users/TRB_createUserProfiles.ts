import { supabase } from "@/backend/server/supabase";
import { adminProcedure } from "@/backend/server/trpc";
import { faker } from "@faker-js/faker";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const genderOptions = ["MALE", "FEMALE", "OTHER"] as const;

// requires that locations exist in db

export const TRB_createUserProfiles = adminProcedure
  .input(
    z.object({
      numUsers: z.number().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const numUsersToCreate = input.numUsers || 10;
    const createdUsers = [];

    // First, get all available locations, traits, and interests
    const locations = await ctx.prisma.location.findMany();
    if (locations.length === 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message:
          "No locations found in database. Please create locations first.",
      });
    }

    const traits = await ctx.prisma.trait.findMany();
    const interests = await ctx.prisma.interest.findMany();

    try {
      for (let i = 0; i < numUsersToCreate; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        // Use a test domain to easily identify and clean up test users
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${faker.string.alphanumeric(4)}@grouply-test.app`;

        // First, create the user in Supabase Auth
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true, // Auto-confirm email for test users
          user_metadata: {
            givenName: firstName,
            familyName: lastName,
          },
        });

        if (authError || !authUser) {
          console.error("Failed to create auth user:", authError);
          continue; // Skip this user and continue with next
        }

        // Pick a random location from the existing ones
        const randomLocation = faker.helpers.arrayElement(locations);

        const result = await ctx.prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              authUserId: authUser.id, // Use the real Supabase auth user ID
              email,
              givenName: `${firstName}`,
              familyName: lastName,
              locationId: randomLocation.id,
              avatarUrl: faker.image.avatar(),
              role: "USER",
              birthday: faker.date.between({
                from: "1980-01-01",
                to: "2000-12-31",
              }),
              gender: faker.helpers.arrayElement(genderOptions),
              bio: faker.lorem.paragraph(),
            },
          });

          // Add random trait scores if traits exist
          const userTraitScores = [];
          if (traits.length > 0) {
            // Select 3-7 random traits for each user
            const numTraits = faker.number.int({
              min: 3,
              max: Math.min(7, traits.length),
            });
            const selectedTraits = faker.helpers.arrayElements(
              traits,
              numTraits,
            );

            for (const trait of selectedTraits) {
              const traitScore = await tx.userTraitScore.create({
                data: {
                  userId: user.id,
                  traitId: trait.id,
                  score: faker.number.float({
                    min: 0,
                    max: 1,
                    fractionDigits: 2,
                  }),
                },
              });
              userTraitScores.push(traitScore);
            }
          }

          // Add random interests if interests exist
          const userInterests = [];
          if (interests.length > 0) {
            // Select 2-6 random interests for each user
            const numInterests = faker.number.int({
              min: 2,
              max: Math.min(6, interests.length),
            });
            const selectedInterests = faker.helpers.arrayElements(
              interests,
              numInterests,
            );

            for (const interest of selectedInterests) {
              const userInterest = await tx.userInterest.create({
                data: {
                  userId: user.id,
                  interestId: interest.id,
                  weight: faker.number.float({
                    min: 0.5,
                    max: 1,
                    fractionDigits: 2,
                  }),
                },
              });
              userInterests.push(userInterest);
            }
          }

          return { user, userTraitScores, userInterests };
        });

        createdUsers.push(result);
      }

      return {
        success: true,
        count: createdUsers.length,
        users: createdUsers,
      };
    } catch (error) {
      console.error("Error creating test users:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create test users",
        cause: error,
      });
    }
  });
