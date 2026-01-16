export interface EventWithSnapshotData {
  id: string;
  interests: string[];
  traits: Record<string, number>;
}

export interface EventCardEvent {
  startsAt: Date;
  name: string;
  formattedLocation: string;
  coverImageUrl: string;
  numCurrentParticipants: number;
  maxAttendees: number;
}

export interface ChatEventSuggestion extends EventCardEvent {
  id: string;
}
