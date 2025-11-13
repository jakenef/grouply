import { prisma } from "@/backend/server/prisma";

export async function getValidEventsFromUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  const now = new Date();
  const userAge =
    now.getFullYear() -
    (userProfile?.birthday?.getFullYear() ?? now.getFullYear());

  const validEvents = await prisma.event.findMany({
    where: {
      startsAt: {
        gt: now,
      },
      AND: [
        {
          OR: [{ lowerAgeLimit: null }, { lowerAgeLimit: { lte: userAge } }],
        },
        {
          OR: [{ upperAgeLimit: null }, { upperAgeLimit: { gte: userAge } }],
        },
      ],
    },
  });

  return validEvents;
}
