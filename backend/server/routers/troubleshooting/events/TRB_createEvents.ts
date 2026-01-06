import { adminProcedure } from "@/backend/server/trpc";
import { faker } from "@faker-js/faker";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const TRB_createEvents = adminProcedure
  .input(
    z.object({
      numEvents: z.number().min(1).max(100).optional().default(10),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // Fetch existing users, locations, and activities
    const users = await ctx.prisma.user.findMany({
      include: {
        traitScores: {
          include: {
            trait: true,
          },
        },
        interests: {
          include: {
            interest: true,
          },
        },
      },
    });
    const locations = await ctx.prisma.location.findMany();
    const activities = await ctx.prisma.activity.findMany();

    if (
      users.length === 0 ||
      locations.length === 0 ||
      activities.length === 0
    ) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message:
          "Need at least one user, location, and activity in the database.",
      });
    }

    const createdEvents = [];

    for (let i = 0; i < input.numEvents; i++) {
      // Pick random organizer, attendees, location, and activity
      const minAttendees = faker.number.int({ min: 2, max: 10 });
      const maxAttendees = faker.number.int({ min: minAttendees + 1, max: 12 });
      const organizer = faker.helpers.arrayElement(users);

      // Create a random number of attendees (not always maxAttendees)
      const numAttendeesToCreate = faker.number.int({
        min: 0,
        max: maxAttendees,
      });
      const attendees = faker.helpers
        .shuffle(users)
        .slice(0, numAttendeesToCreate);

      const location = faker.helpers.arrayElement(locations);
      const activity = faker.helpers.arrayElement(activities);

      // Generate random event fields
      const name = activity.label;
      const desc = `Join us for ${activity.label.toLowerCase()} at ${
        location.city
      }! ${faker.lorem.sentences({ min: 2, max: 4 })}`;
      const startsAt = faker.date.between({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      const endsAt = new Date(
        startsAt.getTime() +
          faker.number.int({ min: 1, max: 6 }) * 60 * 60 * 1000
      );

      const minAgePref = faker.number.int({ min: 18, max: 45 });
      const maxAgePref = faker.number.int({ min: minAgePref + 1, max: 60 });
      const numPics = faker.number.int({ min: 1, max: 4 });
      const pictureUrls = [];

      for (let j = 0; j < numPics; j++) {
        pictureUrls.push(faker.image.url());
      }

      const coverImageUrl = pictureUrls[0];

      // Prepare snapshot data from organizer's profile
      const interestIds = organizer.interests.map((ui) => ui.interestId);

      // Build traitScores object using trait slugs as keys
      const traitScores: Record<string, number> = {};
      for (const ts of organizer.traitScores) {
        traitScores[ts.trait.slug] = ts.score;
      }

      // Create the event with snapshot
      const event = await ctx.prisma.event.create({
        data: {
          id: "TRB_" + uuidv4(),
          name,
          desc,
          startsAt,
          endsAt,
          organizerId: organizer.id,
          locationId: location.id,
          activityId: activity.id,
          minAgeLimit: minAgePref,
          maxAgeLimit: maxAgePref,
          imageUrls: pictureUrls,
          coverImageUrl: coverImageUrl,
          registrations: {
            create: attendees.map((u) => ({
              user: { connect: { id: u.id } },
            })),
          },
          minAttendees,
          maxAttendees,
          isFull: attendees.length >= maxAttendees,
          snapshot: {
            create: {
              hostUserId: organizer.id,
              hostGivenName: organizer.givenName,
              interestIds: interestIds,
              traitScores: traitScores,
            },
          },
        },
      });

      createdEvents.push(event);
    }

    return {
      success: true,
      count: createdEvents.length,
      events: createdEvents,
    };
  });
