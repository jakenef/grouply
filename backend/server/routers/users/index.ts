import { router } from "../../trpc";
import { checkUserExists } from "./checkUserExists";
import { createUserAndUserProfile } from "./createUserAndUserProfile";
import { getAvatarUrlsFromIds } from "./getAvatarUrlsFromIds";
import { getMyProfile } from "./getMyProfile";
import { getPublicProfiles } from "./getPublicProfiles";
import { saveUserAndUserProfilePreferences } from "./saveUserAndUserProfilePreferences";
import { updateMyProfile } from "./updateMyProfile";

export const usersRouter = router({
  checkUserExists,
  createUserAndUserProfile,
  saveUserAndUserProfilePreferences,
  getPublicProfiles,
  getMyProfile,
  updateMyProfile,
  getAvatarUrlsFromIds,
});
