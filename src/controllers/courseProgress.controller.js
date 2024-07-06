import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { CourseProgress } from './../models/courseProgress.model.js';
import { Course } from './../models/course.model.js';
import { Video } from './../models/video.model.js';
const markAsComplete = asyncHandler(async (req, res) => {
    try {
        const {courseId, videoId} = req.body;
    
        if(!courseId || !videoId) {
            throw new ApiError(400, "All feilds are required !!")
        }
    
        const video = await Video.findById(videoId).populate({
            path: "section"
        });
    
        if(!video) {
            throw new ApiError(404, "Video not found !!")
        }
        console.log("Video", video)
        if(video.section.sectionOfCourse.toString() !== courseId) {
            throw new ApiError(400, "Video is not of specified course !!")
        }
    
        const courseProgress = await CourseProgress.findOne({
            userId: req.user?._id,
            courseId
        });
    
        if(courseProgress.completedVideos.includes(videoId)) {
            throw new ApiError(403, "Lecture already completed!!")
        }
    
        courseProgress.completedVideos.push(videoId);
        await courseProgress.save()
    
        return res.status(200).json(
            new ApiResponse(200, courseProgress, "Video Marked as Completed !!")
        )
    } catch (error) {
        console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
    }

})

export { markAsComplete }