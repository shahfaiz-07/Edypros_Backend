import { isValidObjectId } from "mongoose";
import { Section } from "../models/section.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Course } from "../models/course.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { removeFromCloudinary } from "../utils/cloudinary.js";

const createSection = asyncHandler(async (req, res) => {
  const { sectionName, courseId } = req.body;

  if (!sectionName || !courseId) {
    throw new ApiError(400, "All Field are required !!");
  }

  if (!isValidObjectId(courseId)) {
    throw new ApiError(400, "Invalid course id !!");
  }

  const section = await Section.create({
    name: sectionName,
    sectionOfCourse: courseId,
  });

  if (!section) {
    throw new ApiError(500, "Error while creating section !!");
  }

  const course = await Course.findByIdAndUpdate(
    courseId,
    {
      $push: {
        sections: section._id,
      },
    },
    {
      new: true,
    }
  ).populate("sections");

  if (!course) {
    throw new ApiError(500, "Error while updating section in course !!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, course, "Section added to course successfully !!")
    );
});

const updateSection = asyncHandler(async (req, res) => {
    const {sectionName, sectionId} = req.body;

    if(!sectionName || !sectionId) {
        throw new ApiError(400, "All fields are required !!");
    }

    if(!isValidObjectId(sectionId)) {
        throw new ApiError(404, "Invalid section ID!!")
    }

    const section = await Section.findByIdAndUpdate(
        sectionId,
        {
            name: sectionName
        },
        {
            new: true
        }
    )

    if(!section) {
        throw new ApiError(500, "Unable to update section name !!");
    }

    return res.status(200).json(
        new ApiResponse(200, section, "Section data updated successfully !!")
    )
});

const deleteSection = asyncHandler(async(req, res) => {
    const {sectionId} = req.params;

    if(!sectionId) {
        throw new ApiError(200, "sectionID is required !!")
    }
    
    if(!isValidObjectId(sectionId)) {
        throw new ApiError(404, "Invalid section ID!!")
    }

    const section = await Section.findByIdAndDelete(sectionId);

    if(!section) {
        throw new ApiError(404, "Section not found !!");
    }

    const course = await Course.findById(section.sectionOfCourse)

    course.sections = course.sections.filter( (cSection) => cSection.toString() !== section._id.toString())
    await course.save();

    await Promise.all(section.videos.map(async (video) => {
      const deletedVideo = await Video.findByIdAndDelete(video);
      await removeFromCloudinary(deletedVideo.url, "video")
    }));

    return res.status(200).json(
        new ApiResponse(200, section, "Section deleted successfully !!")
    )
})

export {createSection, deleteSection, updateSection};