import { Router } from "express";
import { isInstructor, verifyJWT } from "../middlewares/auth.middleware.js";
import { createSection, deleteSection, updateSection } from "../controllers/section.controller.js";

const router = Router();

router.route('/').post(verifyJWT, isInstructor, createSection).patch(verifyJWT, isInstructor, updateSection);
router.route('/:sectionId').delete(verifyJWT, isInstructor, deleteSection);

export default router;