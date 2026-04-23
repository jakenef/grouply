import { router } from "@/backend/server/trpc";
import { TRB_addActivity } from "./TRB_addActivity";
import { TRB_createActivities } from "./TRB_createActivities";
import { TRB_deleteActivites } from "./TRB_deleteActivities";

export const troubleshootingActivityRouter = router({
  TRB_addActivity,
  TRB_createActivities,
  TRB_deleteActivites,
});
