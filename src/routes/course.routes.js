import { Router } from "express";
import {
  isInstructor,
  isStudent,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  updateCourseThumbnail,
  getCoursesByCategory,
  demoEnrollStudent,
} from "../controllers/course.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/category").get(getCoursesByCategory);

router
  .route("/")
  .post(verifyJWT, isInstructor, upload.single("thumbnail"), createCourse)
  .get(getAllCourses);

router
  .route("/c/:courseId")
  .get(verifyJWT, getCourseById)
  .delete(verifyJWT, isInstructor, deleteCourse)
  .patch(verifyJWT, isInstructor, updateCourse);

router
  .route("/enroll/:courseId")
  .patch(verifyJWT, isStudent, demoEnrollStudent);

router
  .route("/thumbnail/:courseId")
  .patch(
    verifyJWT,
    isInstructor,
    upload.single("thumbnail"),
    updateCourseThumbnail
  );

export default router;
