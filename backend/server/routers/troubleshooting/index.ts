import { router } from "../../trpc";
import { troubleshootingActivityRouter } from "./activities";
import { troubleshootingEventRouter } from "./events";
import { interestsRouter } from "./interests";
import { troubleshootingLocationRouter } from "./locations";
import { troubleshootingTraitsRouter } from "./traits";
import { troubleshootingUserRouter } from "./users";

export const troubleshootingRouter = router({
  troubleshootingLocationRouter,
  troubleshootingUserRouter,
  troubleshootingActivityRouter,
  troubleshootingEventRouter,
  troubleshootingTraitsRouter,
  interestsRouter,
});
