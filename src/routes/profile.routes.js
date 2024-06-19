import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { updateProfile } from "../controllers/profile.controller.js";

const router = Router();

router.use(verifyJWT);

router.route('/update-profile').patch(updateProfile);

export default router;
