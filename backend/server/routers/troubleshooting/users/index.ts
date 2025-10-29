import { router } from "@/backend/server/trpc";
import { TRB_createUserProfiles } from "./TRB_createUserProfiles";
import { TRB_deleteTestUsers } from "./TRB_deleteTestUserProfiles";

export const troubleshootingUserRouter = router({
  TRB_createUserProfiles,
  TRB_deleteTestUsers,
});
