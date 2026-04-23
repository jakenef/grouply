import { router } from "@/backend/server/trpc";
import { TRB_addInterest } from "./TRB_addInterest";
import { TRB_createInterests } from "./TRB_createInterests";
import { TRB_deleteInterests } from "./TRB_deleteInterests";

export const interestsRouter = router({
  TRB_addInterest,
  TRB_createInterests,
  TRB_deleteInterests,
});
