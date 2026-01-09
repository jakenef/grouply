export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  channelId: string | null;
  authorId: string;
  body: string;
  toolName?: string | null;
  createdAt?: string;
};

export enum ChatMessageRole {
  ASSISTANT = "ASSISTANT",
  USER = "USER",
  SYSTEM = "SYSTEM",
  TOOL = "TOOL",
}
