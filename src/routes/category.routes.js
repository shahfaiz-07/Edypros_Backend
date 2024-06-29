import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createCategory,
  getAllCategorys,
  getCategoryPageDetails,
} from "../controllers/category.controller.js";

const router = Router();

router.route("/").get(getAllCategorys).post(verifyJWT, isAdmin, createCategory);
router.route('/:categoryId').get(getCategoryPageDetails);

export default router;
