import { router } from "../../trpc";
import { getAllApprovedInterests } from "./getAllApprovedInterests";

export const interestsRouter = router({
  getAllApprovedInterests,
});
