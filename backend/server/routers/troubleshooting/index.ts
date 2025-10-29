import { router } from "../../trpc";
import { troubleshootingActivityRouter } from "./activities";
import { troubleshootingLocationRouter } from "./locations";
import { troubleshootingUserRouter } from "./users";

export const troubleshootingRouter = router({
  troubleshootingLocationRouter,
  troubleshootingUserRouter,
  troubleshootingActivityRouter,
});
