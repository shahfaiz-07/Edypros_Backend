import { Router } from "express";
import { isInstructor, isStudent, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addToWishlist,
  getInstructorDashboardData,
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
router.route("/instructor-dashboard").get(isInstructor, getInstructorDashboardData);

export default router;
