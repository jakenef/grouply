import { router } from "@/backend/server/trpc";
import { generateUserLoginLink } from "./generateUserLoginLink";

export const troubleshootingAuthRouter = router({
  generateUserLoginLink,
});
