import { Router } from "express";
import { isInstructor, verifyJWT } from "../middlewares/auth.middleware.js";
import { createSection, deleteSection } from "../controllers/section.controller.js";

const router = Router();

router.route('/create').post(verifyJWT, isInstructor, createSection);
router.route('/delete/:sectionId').delete(verifyJWT, isInstructor, deleteSection);

export default router;