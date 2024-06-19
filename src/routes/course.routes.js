import { Router } from "express";
import { isInstructor, verifyJWT } from "../middlewares/auth.middleware.js";
import { createCourse, deleteCourse, getCourseById } from "../controllers/course.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/create').post(verifyJWT, isInstructor, upload.single('thumbnail'), createCourse)
router.route('/:courseId').get(verifyJWT, getCourseById);
router.route('/delete/:courseId').delete(verifyJWT, isInstructor, deleteCourse);

export default router;