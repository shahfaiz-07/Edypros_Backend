import { Router } from "express";
import { isStudent, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addToWishlist,
  getWishlistData,
  removeCourseFromWishlist,
  updateProfile,
  upgradeToInstructor,
} from "../controllers/profile.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/update-profile").patch(updateProfile);
router.route("/upgrade-account").patch(isStudent, upgradeToInstructor);
router
  .route("/wishlist")
  .get(isStudent, getWishlistData)
  .patch(isStudent, addToWishlist)
  .delete(isStudent, removeCourseFromWishlist);

export default router;
