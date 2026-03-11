import { router } from "../../trpc";
import { getStatus } from "./getStatus";
import { verifyReceipt } from "./verifyReceipt";

export const subscriptionsRouter = router({
  getStatus,
  verifyReceipt,
});
