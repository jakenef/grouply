import { router } from "../../trpc";
import { userSendAIMessage } from "./userSendAIMessage";

export const messagesAIRouter = router({
  userSendAIMessage,
});
