import { router } from "../../trpc";
import { troubleshootingActivityRouter } from "./activities";
import { troubleshootingAuthRouter } from "./auth";
import { troubleshootingEventRouter } from "./events";
import { interestsRouter } from "./interests";
import { troubleshootingLocationRouter } from "./locations";
import { troubleshootingTraitsRouter } from "./traits";
import { troubleshootingUserRouter } from "./users";

// TODO: remove endpoints and have scripts that i can just run... maybe
export const troubleshootingRouter = router({
  troubleshootingLocationRouter,
  troubleshootingUserRouter,
  troubleshootingActivityRouter,
  troubleshootingEventRouter,
  troubleshootingTraitsRouter,
  interestsRouter,
  troubleshootingAuthRouter,
});
