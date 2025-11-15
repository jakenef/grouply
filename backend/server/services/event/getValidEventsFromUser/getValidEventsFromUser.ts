import { prisma } from "@/backend/server/prisma";
import { UserWithTraitsAndInterests } from "@/types/User";

export async function getValidEventsFromUser(user: UserWithTraitsAndInterests) {
  const now = new Date();
  const userAge =
    now.getFullYear() - (user.birthday?.getFullYear() ?? now.getFullYear());

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
          OR: [{ lowerAgeLimit: null }, { lowerAgeLimit: { lte: userAge } }],
        },
        {
          OR: [{ upperAgeLimit: null }, { upperAgeLimit: { gte: userAge } }],
        },
      ],
      location: {
        lat: { gte: minLat, lte: maxLat },
        lng: { gte: minLng, lte: maxLng },
      },
      isFull: false,
      isCancelled: false,
    },
    include: {
      snapshot: true,
    },
  });

  return validEvents;
}
