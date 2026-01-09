import { router } from "../../trpc";
import { checkUserExists } from "./checkUserExists";
import { createUser } from "./createUser";
import { getAvatarUrlsFromIds } from "./getAvatarUrlsFromIds";
import { getMyUser } from "./getMyUser";
import { getPublicUserInfoById } from "./getPublicUserInfoById";
import { saveUserPreferences } from "./saveUserPreferences";
import { updateMyUser } from "./updateMyUser";

// TODO: consolidate user creation flow
export const usersRouter = router({
  checkUserExists,
  createUser,
  saveUserPreferences,
  getPublicUserInfoById,
  getMyUser,
  updateMyUser,
  getAvatarUrlsFromIds,
});
