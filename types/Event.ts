export interface Event {
  id: string;
  title: string;
  location: string;
  dateTime: Date;
  thumbnailUrl: string;
  maxParticipants: number;
  currentParticipants: number;
}

export interface EventWithSnapshotData {
  id: string;
  interests: string[];
  traits: Record<string, number>;
}
