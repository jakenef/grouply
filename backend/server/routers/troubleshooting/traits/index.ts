import { router } from "@/backend/server/trpc";
import { TRB_addTrait } from "./TRB_addTrait";
import { TRB_createTraits } from "./TRB_createTraits";
import { TRB_deleteTraits } from "./TRB_deleteTraits";

export const troubleshootingTraitsRouter = router({
  TRB_addTrait,
  TRB_createTraits,
  TRB_deleteTraits,
});
