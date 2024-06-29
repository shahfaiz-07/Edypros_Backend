import { Router } from "express";
import {isStudent, verifyJWT} from "../middlewares/auth.middleware.js"
import { capturePayment, sendPaymentSuccessEmail, verifySignature } from "../controllers/payment.controller.js";
const router = new Router();

router.route("/capture-payment").post(verifyJWT, isStudent, capturePayment)
router.route("/verify-signature").post(verifyJWT, isStudent, verifySignature)
router.route("/send-confirmation-email").post(verifyJWT, isStudent, sendPaymentSuccessEmail)

export default router;