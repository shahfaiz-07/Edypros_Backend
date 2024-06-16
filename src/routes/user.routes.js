import { Router } from "express";
import { login, logout, register } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(register);
router.route('/login').post(login);

//protected routes
router.route('/logout').post(verifyJWT, logout);
export default router;