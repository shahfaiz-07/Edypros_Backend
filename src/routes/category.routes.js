import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { createCategory, getAllCategorys } from "../controllers/category.controller.js";

const router = Router();

router.route('/get-categories').get(getAllCategorys);
router.route('/create').post(verifyJWT, isAdmin, createCategory)

export default router;
