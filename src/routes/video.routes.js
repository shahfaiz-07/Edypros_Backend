import { Router } from "express";
import { isInstructor, verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createVideo, deleteVideo, updateVideo, updateVideoURL } from "../controllers/video.controller.js";

const router = Router();

router.route('/upload').post(verifyJWT, isInstructor, upload.single('video'), createVideo);
router.route('/update/:videoId').patch(verifyJWT, isInstructor, updateVideo);
router.route('/update-url/').patch(verifyJWT, isInstructor, upload.single('video'),updateVideoURL)
router.route('/delete/:videoId').delete(verifyJWT, isInstructor, deleteVideo)

export default router