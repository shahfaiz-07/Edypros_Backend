import { Router } from "express";
import { isStudent, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createRating,
  getAllCourseRatingsAndReviews,
  getAverageRating,
  getTopRatingsAndReviews,
} from "../controllers/ratingAndReview.controller.js";

const router = Router();

router
  .route("/")
  .post(verifyJWT, isStudent, createRating)
  .get(getTopRatingsAndReviews);

router.route("/c/:courseId").get(getAllCourseRatingsAndReviews);

router.route("/average-rating").get(getAverageRating);

export default router;
