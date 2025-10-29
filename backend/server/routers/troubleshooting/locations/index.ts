import { router } from "@/backend/server/trpc";
import { TRB_createLocations } from "./TRB_createLocations";
import { TRB_deleteTestLocations } from "./TRB_deleteLocations";

export const troubleshootingLocationRouter = router({
  TRB_createLocations,
  TRB_deleteTestLocations,
});
