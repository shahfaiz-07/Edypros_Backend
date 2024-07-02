import { Router } from "express";
import { isStudent, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createRating,
  editRating,
  getAllCourseRatingsAndReviews,
  getAverageRating,
  getTopRatingsAndReviews,
} from "../controllers/ratingAndReview.controller.js";

const router = Router();

router
  .route("/")
  .post(verifyJWT, isStudent, createRating)
  .patch(verifyJWT, isStudent, editRating)
  .get(getTopRatingsAndReviews);

router.route("/c/:courseId").get(getAllCourseRatingsAndReviews);

router.route("/average-rating").get(getAverageRating);

export default router;
