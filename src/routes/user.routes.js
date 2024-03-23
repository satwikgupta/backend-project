import { Router } from "express";
import {
  loginUser,
  logOutUser,
  registerUser,
  getCurrentUser,
  getWatchHistory,
  updateUserAvatar,
  refreshAccessToken,
  updateUserCoverImage,
  updateAccountDetails,
  getUserChannelProfile,
  changeCurrentPassword,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//http://localhost:8000/api/v1/users/register
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 3 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").patch(verifyJWT, changeCurrentPassword);
// user profile routes
router.route("/user").get(verifyJWT, getCurrentUser);
// user profile update routes
router.route("/update").patch(verifyJWT, updateAccountDetails);
// user avatar update route
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
// user cover image update route
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
// user profile routes
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
// watch history routes
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
