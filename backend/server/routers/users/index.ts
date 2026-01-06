import { router } from "../../trpc";
import { checkUserExists } from "./checkUserExists";
import { createUserAndUserProfile } from "./createUserAndUserProfile";
import { getAvatarUrlsFromIds } from "./getAvatarUrlsFromIds";
import { getMyUser } from "./getMyUser";
import { getPublicProfileById } from "./getPublicProfileById";
import { saveUserAndUserProfilePreferences } from "./saveUserAndUserProfilePreferences";
import { updateMyUserAndProfile } from "./updateMyProfile";

export const usersRouter = router({
  checkUserExists,
  createUserAndUserProfile,
  saveUserAndUserProfilePreferences,
  getPublicProfileById,
  getMyUser,
  updateMyUserAndProfile,
  getAvatarUrlsFromIds,
});
