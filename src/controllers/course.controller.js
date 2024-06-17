import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { Course } from '../models/course.model.js';
import { isValidObjectId } from 'mongoose';
import { Category } from './../models/category.model';
const createCourse = asyncHandler(async (req, res) => {
    const { name, description, learnings, price, category, tags } = req.body;

    if([name, description, learnings, price, category].some( (field) => field !== "")) {
        throw new ApiError(400, "All fields are required !!");
    }
    
    const categoryObj = await Category.findOne({title: category});

    if(!categoryObj) {
        throw new ApiError(404, "Invalid category !!");
    }
    const thumbnailLocalPath = req.file?.path;

    if(!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required !!");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail) {
        throw new ApiError(500, "Error while uploading thumbnail to cloudinary !!");
    }

    console.log(thumbnail)

    const course = await Course.create({
        name, description, learnings, price, thumbnail: thumbnail.url, category:categoryObj._id, instructor: req.user?._id, tags
    });

    if(!course) {
        throw new ApiError(500, "Error while saving course to DB !!");
    }

    const instructor = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $push : {
                registeredCourses: course._id
            }
        }
    );

    if(!instructor) {
        throw new ApiError(500, "Error while updating instructor data !!")
    }

    categoryObj.courses.push(course._id);
    await categoryObj.save();

    return res.status(200).json(
        new ApiResponse(200, course, "Course created successfully !!")
    )
});

const getAllCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find();

    if(!courses) {
        throw new ApiError(500, "Error while fetching all courses !!");
    }

    return res.status(200).json(
        new ApiResponse(200, courses, "Courses fetched successfully !!")
    )
})

const getCoursesByTag = asyncHandler(async (req, res) => {
    const { category } = req.body;
    if(!category) {
        throw new ApiError(400, "Category is requried !!");
    }

    const courses = await Category.findOne({title: category}).select("courses");

    if(!courses) {
        throw new ApiError(500, "Error while fetching courses from the DB !!");
    }

    return res.status(200).json(
        new ApiResponse(200, courses, "Courses fetched successfully !!")
    );
});

const getCourseById = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if(!courseId) {
        throw new ApiError(400, "Course ID is required !!");
    }

    if(!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid course id !!");
    }

    const course = await Course.findById(courseId).populate("instructor");

    if(!course) {
        throw new ApiError(404, "Course not found !!");
    }

    return res.status(200).json(
        new ApiResponse(200, course, "Course data fetched successfully !!")
    )
})
const getCourseByTitle = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if(!title) {
        throw new ApiError(400, "Course title is required !!");
    }

    const course = await Course.findOne({name}).populate("instructor");

    if(!course) {
        throw new ApiError(404, "Course not found !!");
    }

    return res.status(200).json(
        new ApiResponse(200, course, "Course data fetched successfully !!")
    )
})

const updateCourse = asyncHandler(async (req, res) => {
    const {courseId} = req.params;

    if(!courseId) {
        throw new ApiError(400, "Course id is requried !!");
    }

    if(!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid course id !!");
    }

    const { name, description, learnings, price, category, tags } = req.body;

    if([name, description, learnings, price, category].some( (field) => field !== "")) {
        throw new ApiError(400, "All fields are required !!");
    }

    const course = await Course.findByIdAndUpdate(
        courseId,
        {
            name, description, learnings, price, category, tags
        },
        {
            new: true
        }
    )

    if(!course) {
        throw new ApiError(404, "Course not found !!");
    }

    return res.status(200).json(
        new ApiResponse(200, course, "Course data updated sucessfully !!")
    )
})

export {createCourse, getCoursesByTag, getAllCourses, getCourseById, getCourseByTitle, updateCourse}
