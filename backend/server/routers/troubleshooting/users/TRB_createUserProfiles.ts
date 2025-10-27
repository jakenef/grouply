import { adminProcedure } from "@/backend/server/trpc";
import { faker } from "@faker-js/faker";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const genderOptions = ["Male", "Female", "Other"] as const;

// requires that locations exist in db

export const TRB_createUserProfiles = adminProcedure
  .input(
    z.object({
      numUsers: z.number().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const numUsersToCreate = input.numUsers || 10;
    const createdUsers = [];

    // First, get all available locations
    const locations = await ctx.prisma.location.findMany();
    if (locations.length === 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message:
          "No locations found in database. Please create locations first.",
      });
    }

    try {
      for (let i = 0; i < numUsersToCreate; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const testUserId = `TRB_createUsers_${faker.string.alphanumeric(8)}`;

        // Pick a random location from the existing ones
        const randomLocation = faker.helpers.arrayElement(locations);

        const result = await ctx.prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              authUserId: testUserId,
              email: faker.internet.email({ firstName, lastName }),
              displayName: `${firstName} ${lastName}`,
              locationId: randomLocation.id,
              avatarUrl: faker.image.avatar(),
              role: "USER",
            },
          });

          const profile = await tx.userProfile.create({
            data: {
              userId: user.id,
              birthday: faker.date.between({
                from: "1980-01-01",
                to: "2000-12-31",
              }),
              gender: faker.helpers.arrayElement(genderOptions),
              bio: faker.lorem.paragraph(),
            },
          });

          return { user, profile };
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
