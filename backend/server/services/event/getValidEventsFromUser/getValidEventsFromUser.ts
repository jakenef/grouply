import { prisma } from "@/backend/server/prisma";
import { UserWithTraitsAndInterests } from "@/shared/types/User";
import calculateAge from "@/shared/utils/calculateAge";

export async function getValidEventsFromUser(user: UserWithTraitsAndInterests) {
  const now = new Date();
  const userAge = calculateAge(user.birthday) ?? 0;
  if (!user.location) return [];

  const { lat, lng } = user.location;
  const radiusKm = user.maxTravelKm ?? 50;

  // Bounding box deltas (for location filtering)
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLng = lng - lngDelta;
  const maxLng = lng + lngDelta;

  const validEvents = await prisma.event.findMany({
    where: {
      startsAt: {
        gt: now,
      },
      AND: [
        {
          OR: [{ minAgeLimit: null }, { minAgeLimit: { lte: userAge } }],
        },
        {
          OR: [{ maxAgeLimit: null }, { maxAgeLimit: { gte: userAge } }],
        },
      ],
      location: {
        lat: { gte: minLat, lte: maxLat },
        lng: { gte: minLng, lte: maxLng },
      },
      isFull: false,
      isCanceled: false,
      registrations: { none: { userId: user.id } },
    },
    include: {
      snapshot: { include: { traitScores: true } },
      organizer: true,
      activity: true,
      location: true,
      registrations: true,
    },
  });

  return validEvents;
}
