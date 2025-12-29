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
  assistant = "assistant",
  user = "user",
  system = "system",
  tool = "tool",
}
