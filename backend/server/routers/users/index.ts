import { router } from "../../trpc";
import { checkUserExists } from "./checkUserExists";
import { createUserAndUserProfile } from "./createUserAndUserProfile";
import { getAvatarUrlsFromIds } from "./getAvatarUrlsFromIds";
import { getMyProfile } from "./getMyProfile";
import { getPublicProfileById } from "./getPublicProfileById";
import { saveUserAndUserProfilePreferences } from "./saveUserAndUserProfilePreferences";
import { updateMyProfile } from "./updateMyProfile";

export const usersRouter = router({
  checkUserExists,
  createUserAndUserProfile,
  saveUserAndUserProfilePreferences,
  getPublicProfileById,
  getMyProfile,
  updateMyProfile,
  getAvatarUrlsFromIds,
});
