import { z } from "zod";

// Location data validation schema
export const locationDataSchema = z.object({
  placeId: z.string(),
  city: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  countryCode: z.string().nullable().optional(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  formatted: z.string(),
  name: z.string().nullable().optional(),
});

// Gender enum validation
export const genderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);

// Event location schema (simplified for frontend)
export const eventLocationSchema = z.object({
  id: z.string(),
  formatted: z.string().nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  countryCode: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
});

// Event organizer schema (basic info)
export const eventOrganizerSchema = z.object({
  id: z.string(),
  givenName: z.string(),
  avatarUrl: z.string().nullable(),
});

// Activity schema
export const activitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  label: z.string(),
});

// Event snapshot trait score schema
export const eventSnapshotTraitScoreSchema = z.object({
  traitSlug: z.string(),
  score: z.number(),
});

// Event snapshot schema (for matching data)
export const eventSnapshotSchema = z.object({
  hostUserId: z.string(),
  hostGivenName: z.string().nullable(),
  interestIds: z.array(z.string()),
  traitScores: z.array(eventSnapshotTraitScoreSchema),
});

// Complete Event DTO for frontend
export const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  desc: z.string().nullable(),
  startsAt: z.date(),
  endsAt: z.date(),
  isCanceled: z.boolean(),
  maxAgeLimit: z.number().nullable(),
  minAgeLimit: z.number().nullable(),
  imageUrls: z.array(z.string()),
  coverImageUrl: z.string(),

  // Organizer info
  organizer: eventOrganizerSchema,

  // Activity
  activity: activitySchema,

  // Location
  location: eventLocationSchema,

  // Capacity
  maxAttendees: z.number(),
  minAttendees: z.number(),
  currentAttendees: z.number(),
  isFull: z.boolean(),

  // Snapshot (for matching/recommendation context)
  snapshot: eventSnapshotSchema.nullable(),

  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Scored event for recommendation endpoints
export const scoredEventSchema = z.object({
  event: eventSchema,
  score: z.number(),
});

// Export types derived from schemas
export type LocationData = z.infer<typeof locationDataSchema>;
export type Gender = z.infer<typeof genderEnum>;
export type EventLocation = z.infer<typeof eventLocationSchema>;
export type EventOrganizer = z.infer<typeof eventOrganizerSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type EventSnapshotTraitScore = z.infer<
  typeof eventSnapshotTraitScoreSchema
>;
export type EventSnapshot = z.infer<typeof eventSnapshotSchema>;
export type Event = z.infer<typeof eventSchema>;
export type ScoredEvent = z.infer<typeof scoredEventSchema>;
