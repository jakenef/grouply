import { router } from "../../trpc";
import { getAllApprovedTraits } from "./getAllApprovedTraits";

export const traitsRouter = router({
  getAllApprovedTraits,
});
