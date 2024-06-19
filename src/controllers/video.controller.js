import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { removeFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js'
import { Video } from "../models/video.model.js";
import { ApiResponse } from '../utils/ApiResponse.js'
import { Section } from './../models/section.model.js';
import { isValidObjectId } from "mongoose";

const createVideo = asyncHandler(async (req, res) => {
    const { title, description, sectionId } = req.body;

    if(!title || !description || !sectionId) {
        throw new ApiError(400, "All fields are required !!")
    }

    if(!isValidObjectId(sectionId)) {
        throw new ApiError(400, "Invalid Object Id !!")
    }

    const videoLocalPath = req.file?.path;

    if(!videoLocalPath) {
        throw new ApiError(400, "Video file is required !!");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);

    if(!videoFile) {
        throw new ApiError(500, "Failed to upload video file to cloudinary !!");
    }

    const video = await Video.create({
        title, duration: videoFile.duration,
        description,
        url: videoFile.secure_url,
        section: sectionId
    })

    if(!video) {
        throw new ApiError(500, "Unable to upload file to DB !!");
    }

    const section = await Section.findByIdAndUpdate(
        sectionId,
        {
            $push : {
                videos: video._id
            }
        },
        {
            new: true
        }
    ).populate("videos");

    if(!section) {
        throw new ApiError(500, "Cannot add video file to section !!")
    }

    return res.status(200).json(
        new ApiResponse(200, section, "Video file uploaded successfully !!")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!videoId) {
        throw new ApiError(400, "Video id is required !!");
    }

    if(!isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid object id !!")
    }

    const {title, description} = req.body;

    if(!title || !description) {
        throw new ApiError(400, "All fields are required !!");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            title,
            description
        },
        {
            new: true
        }
    ).populate("section");

    if(!video) {
        throw new ApiError(500, "Unable to update video file data !!")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video file updated sucessfully !!")
    );
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
  
    if (!videoId) {
      throw new ApiError(400, "Video id is required !!");
    }
  
    if (!isValidObjectId(videoId)) {
      throw new ApiError(404, "Invalid object id !!");
    }
  
    const video = await Video.findByIdAndDelete(videoId);

    
    if (!video) {
        throw new ApiError(404, "Video not found !!");
    }
    await removeFromCloudinary(video.url, "video")
    
    const section = await Section.findById(video.section);
    
    if (!section) {
      throw new ApiError(404, "Section not found !!");
    }
  
    section.videos = section.videos.filter((v) => v.toString() !== videoId.toString());
  
    await section.save();
  
    return res.status(200).json(
      new ApiResponse(200, video, "Video file deleted successfully !!")
    );
  });
  

export {createVideo, updateVideo, deleteVideo}