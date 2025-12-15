import { router } from "@/backend/server/trpc";
import { TRB_createEvents } from "./TRB_createEvents";
import { TRB_deleteTestEvents } from "./TRB_deleteTestEvents";

export const troubleshootingEventRouter = router({
  TRB_createEvents,
  TRB_deleteTestEvents,
});
