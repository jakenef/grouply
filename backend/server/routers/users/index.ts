import { router } from "../../trpc";
import { checkUserExists } from "./checkUserExists";
import { createUser } from "./createUser";
import { getAvatarUrlsFromIds } from "./getAvatarUrlsFromIds";
import { getMyUser } from "./getMyUser";
import { getPublicUserInfoById } from "./getPublicUserInfoById";
import { setupUserAndPreferences } from "./setupUserAndPreferences";
import { updateMyUser } from "./updateMyUser";

// TODO: consolidate user creation flow
export const usersRouter = router({
  checkUserExists,
  createUser,
  setupUserAndPreferences,
  getPublicUserInfoById,
  getMyUser,
  updateMyUser,
  getAvatarUrlsFromIds,
});
