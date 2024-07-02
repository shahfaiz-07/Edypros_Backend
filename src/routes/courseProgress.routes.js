import { Router } from "express";
import { verifyJWT, isStudent } from "../middlewares/auth.middleware.js"
import { markAsComplete } from "../controllers/courseProgress.controller.js";

const router = Router();

router.route("/").post(verifyJWT, isStudent, markAsComplete);

export default router;