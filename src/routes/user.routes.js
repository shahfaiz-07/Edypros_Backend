import { Router } from "express";
import { changePassword, deleteAccount, generateResetToken, getUserDetails, login, logout, refreshAccessToken, register, resetPassword, sendOTP, updateAvatar } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/send-otp').post(sendOTP);
router.route('/reset-password-token').post(generateResetToken)
router.route('/reset-password/:passToken').post(resetPassword)
router.route('/refresh-token').post(refreshAccessToken);
//protected routes
router.route('/logout').post(verifyJWT, logout);
router.route('/change-password').post(verifyJWT, changePassword)
router.route('/current-user').get(verifyJWT, getUserDetails);
router.route('/change-avatar').patch(verifyJWT, upload.single('avatar'),updateAvatar)
router.route('/delete').delete(verifyJWT, deleteAccount);

export default router;