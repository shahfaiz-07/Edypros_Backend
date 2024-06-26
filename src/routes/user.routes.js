import { Router } from "express";
import { changePassword, deleteAccount, generateResetToken, getUserDetails, handleForm, login, logout, refreshAccessToken, register, resetPassword, sendOTP, updateAvatar } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getRegisteredCourses } from "../controllers/course.controller.js";

const router = Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/send-otp').post(sendOTP);
router.route('/reset-password-token').post(generateResetToken)
router.route('/reset-password/:passToken').post(resetPassword)
router.route('/refresh-token').post(refreshAccessToken);
router.route('/contact-us').post(handleForm)
//protected routes
router.route('/logout').post(verifyJWT, logout);
router.route('/change-password').patch(verifyJWT, changePassword)
router.route('/current-user').get(verifyJWT, getUserDetails);
router.route('/change-avatar').patch(verifyJWT, upload.single('avatar'),updateAvatar)
router.route('/delete').delete(verifyJWT, deleteAccount);
router.route('/registered-courses').get(verifyJWT, getRegisteredCourses);

export default router;