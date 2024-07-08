import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  removeFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { Course } from "../models/course.model.js";
import { isValidObjectId } from "mongoose";
import { Category } from "./../models/category.model.js";
import { User } from "../models/user.model.js";
import { Section } from "../models/section.model.js";
import { Video } from "../models/video.model.js";
import { CourseProgress } from './../models/courseProgress.model.js';
import { RatingAndReview } from "../models/ratingAndReview.model.js";
const createCourse = asyncHandler(async (req, res) => {
  try {
    const { name, description, learnings, price, category, tags, preRequisites, language } =
      req.body;
    console.log(req.body);
    console.log(req.body);
    if (!name || !description || !learnings || !price || !category) {
      throw new ApiError(400, "All fields are required !!");
    }
  
    const categoryObj = await Category.findById(category);
    console.log(categoryObj);
    if (!categoryObj) {
      throw new ApiError(404, "Invalid category !!");
    }
    const thumbnailLocalPath = req.file?.path;
  
    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Thumbnail file is required !!");
    }
  
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  
    if (!thumbnail) {
      throw new ApiError(500, "Error while uploading thumbnail to cloudinary !!");
    }
  
    console.log(thumbnail);
  
    const course = await Course.create({
      name,
      description,
      learnings,
      language,
      price,
      thumbnail: thumbnail.url,
      category: categoryObj._id,
      instructor: req.user?._id,
      tags: JSON.parse(tags),
      preRequisites: JSON.parse(preRequisites),
    });
  
    if (!course) {
      throw new ApiError(500, "Error while saving course to DB !!");
    }
  
    const instructor = await User.findByIdAndUpdate(req.user?._id, {
      $push: {
        registeredCourses: course._id,
      },
    });
  
    if (!instructor) {
      throw new ApiError(500, "Error while updating instructor data !!");
    }
  
    categoryObj.courses.push(course._id);
    await categoryObj.save();
  
    return res
      .status(200)
      .json(new ApiResponse(200, course, "Course created successfully !!"));
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const getAllCourses = asyncHandler(async (req, res) => {
  try {
    const courses = await Course.find();
  
    if (!courses) {
      throw new ApiError(500, "Error while fetching all courses !!");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, courses, "Courses fetched successfully !!"));
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const getCoursesByCategory = asyncHandler(async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) {
      throw new ApiError(400, "Category is requried !!");
    }
  
    const courses = await Category.findOne({ title: category }).populate(
      "courses"
    );
  
    if (!courses) {
      throw new ApiError(500, "Error while fetching courses from the DB !!");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, courses, "Courses fetched successfully !!"));
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const getCoursePreview = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
  
    if (!courseId) {
      throw new ApiError(400, "Course ID is required !!");
    }
  
    if (!isValidObjectId(courseId)) {
      throw new ApiError(400, "Invalid course id !!");
    }
  
    const course = await Course.findById(courseId).populate([
      {
        path: "sections",
        populate: {
          path: "videos",
          model: "Video",
          select: "title duration",
        },
      },
      {
        path: "ratingAndReviews",
        select: "rating"
      },
      {
        path: "instructor",
        select: "firstName lastName avatar createdAt",
        populate: {
          path: "profile",
          select: "about",
        },
      },
      {
        path: "category",
        select: "title color",
      },
    ]);
    if (!course) {
      throw new ApiError(500, "Cannot fetch course details !!");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, course, "Course data fetched successfully !!"));
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const getCourseById = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
  
    if (!courseId) {
      throw new ApiError(400, "Course ID is required !!");
    }
  
    if (!isValidObjectId(courseId)) {
      throw new ApiError(400, "Invalid course id !!");
    }
  
    const course = await Course.findById(courseId).populate({
      path: "sections",
      populate: {
        path: "videos",
        model: "Video",
      },
    });
    if (!course) {
      throw new ApiError(500, "Cannot fetch course details !!");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, course, "Course data fetched successfully !!"));
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});
const getCourseByTitle = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
  
    if (!title) {
      throw new ApiError(400, "Course title is required !!");
    }
  
    const course = await Course.findOne({ name }).populate("instructor");
  
    if (!course) {
      throw new ApiError(404, "Course not found !!");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, course, "Course data fetched successfully !!"));
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const updateCourse = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
  
    if (!courseId) {
      throw new ApiError(400, "Course id is requried !!");
    }
  
    if (!isValidObjectId(courseId)) {
      throw new ApiError(400, "Invalid course id !!");
    }
  
    const { name, description, learnings, price, category, tags, preRequisites } =
      req.body;
  
    if (
      [name, description, learnings, price, category].some(
        (field) => field === ""
      )
    ) {
      throw new ApiError(400, "All fields are required !!");
    }
  
    const course = await Course.findByIdAndUpdate(courseId, {
      name,
      description,
      learnings,
      price,
      category,
      tags: JSON.parse(tags),
      preRequisites: JSON.parse(preRequisites),
    });
  
    if (course.category !== category) {
      const oldCategory = await Category.findById(course.category);
      oldCategory.courses = oldCategory.courses.filter(
        (course) => course !== course._id
      );
      await oldCategory.save();
  
      const newCategory = await Category.findByIdAndUpdate(category, {
        $push: {
          courses: course._id,
        },
      });
  
      if (!newCategory) {
        throw new ApiError(500, "Cannot change course category !!");
      }
    }
  
    if (!course) {
      throw new ApiError(404, "Course not found !!");
    }
  
    const updatedCourse = await Course.findById(course._id).populate({
      path: "sections",
      populate: {
        path: "videos",
        model: "Video",
      },
    });
  
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedCourse, "Course data updated sucessfully !!")
      );
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const deleteCourse = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
  
    if (!courseId) {
      throw new ApiError(400, "Course ID is required !!");
    }
  
    if (!isValidObjectId(courseId)) {
      throw new ApiError(400, "Invalid course id !!");
    }
  
    const course = await Course.findByIdAndDelete(courseId);
  
    if (!course) {
      throw new ApiError(404, "Course not found !!");
    }
  
    await removeFromCloudinary(course.thumbnail);
  
    const instructor = await User.findById(course.instructor);
  
    const category = await Category.findById(course.category);
  
    category.courses = category.courses.filter(
      (eachCourse) => eachCourse !== course._id
    );
    await category.save();
    if (!category) {
      throw new ApiError(500, "Course cannot be removed from category");
    }
  
    instructor.registeredCourses = instructor.registeredCourses.filter(
      (createdCourse) => createdCourse.toString() !== course._id.toString()
    );
  
    await instructor.save();
  
    if (!instructor) {
      throw new ApiError(500, "Cannot remove course from instructor's database");
    }
  
    await Promise.all(
      course.sections.map(async (section) => {
        const deletedSection = await Section.findByIdAndDelete(section);
        await Promise.all(
          deletedSection.videos.map(async (video) => {
            const deletedVideo = await Video.findByIdAndDelete(video);
            await removeFromCloudinary(deletedVideo.url, "video");
          })
        );
      })
    );
  
    await Promise.all(
      course.studentsEnrolled.map(async (studentId) => {
        const student = await User.findById(studentId);
        student.registeredCourses = student.registeredCourses.filter(
          (registeredCourseId) => registeredCourseId.toString() !== course._id
        );
        await student.save();
      })
    );
  
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          course,
          "Course and related content deleted successfully !!"
        )
      );
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const updateCourseThumbnail = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
  
    if (!courseId) {
      throw new ApiError(400, "Course ID is required !!");
    }
  
    if (!isValidObjectId(courseId)) {
      throw new ApiError(400, "Invalid object id!!");
    }
  
    const thumbnailLocalPath = req.file?.path;
  
    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Thumbnail file is required !!");
    }
  
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  
    if (!thumbnail) {
      throw new ApiError(500, "Error while uploading to cloudinary !!");
    }
  
    const course = await Course.findByIdAndUpdate(courseId, {
      $set: {
        thumbnail: thumbnail.secure_url,
      },
    }).populate({
      path: "sections",
      populate: {
        path: "videos",
        model: "Video",
      },
    });
  
    if (!course) {
      throw new ApiError(500, "Error while updating thumbnail !!");
    }
  
    await removeFromCloudinary(course.thumbnail);
  
    course.thumbnail = thumbnail.secure_url;
  
    return res
      .status(200)
      .json(
        new ApiResponse(200, course, "Course thumbnail updated successfully !!")
      );
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const getRegisteredCourses = asyncHandler(async (req, res) => {
  try {
    const registeredCourses = await User.findById(req.user?._id)
      .select("registeredCourses")
      .populate({
        path: "registeredCourses",
        // select: "instructor studentsEnrolled",
        populate: [
          {
            path: "instructor",
            model: "User",
            select: "firstName lastName",
          },
          {
            path: "category",
            model: "Category",
            select: "title color",
          },
          {
            path: "sections",
            model: "Section",
            select: "videos",
            populate: {
              path: "videos",
              model: "Video",
              select: "duration",
            },
          },
          {
            path: "ratingAndReviews",
            model: "RatingAndReview",
          },
        ],
      });
    if (!registeredCourses) {
      throw new ApiError(404, "Courses not found !!");
    }
  
    const courseProgress = await CourseProgress.find({
      userId: req.user?._id
    }).populate({
      path: "courseId",
      populate: [
        {
          path: "instructor",
          model: "User",
          select: "firstName lastName",
        },
        {
          path: "category",
          model: "Category",
          select: "title color",
        },
        {
          path: "sections",
          model: "Section",
          select: "videos",
          populate: {
            path: "videos",
            model: "Video",
            select: "duration",
          },
        },
        {
          path: "ratingAndReviews",
          model: "RatingAndReview",
        },
      ],
    })
    if(courseProgress.length !== registeredCourses.registeredCourses.length) {
      throw new ApiError(500, "Unable to fetch course progress data!!")
    }
  
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          courseProgress,
          "Registered Courses fetched successfully !!"
        )
      );
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const getInstructorRegisteredCourses = asyncHandler(async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user?.id }).populate([{
      path: "sections",
      select: "videos",
      populate: {
        path: "videos",
        select: "duration",
      },
    },{
      path: "category",
      select: "title color"
    }]);
  
    return res
      .status(200)
      .json(
        new ApiResponse(200, courses, "Instructor Courses fetched successfully!!")
      );
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const changeCourseStatus = asyncHandler(async (req, res) => {
  try {
    const { status, courseId } = req.body;
    if (!status || !courseId) {
      throw new ApiError(400, "All fields are required !!");
    }
  
    if (!isValidObjectId(courseId)) {
      throw new ApiError(400, "Invalid Course ID !!");
    }

    const course = await Course.findById(courseId);
    if(status === "Draft" && course.studentsEnrolled.length > 0) {
      throw new ApiError(403, "Cannot draft a course which already have students enrolled !!")
    }

    if (!course) {
      throw new ApiError(404, "Course not found !!");
    }

    course.status=status
    await course.save();
  
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Course status updated !!"));
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const getCourseData = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.body;
  
    if(!courseId) {
      throw new ApiError(400, "CourseID is required !!")
    }
  
    const course = await Course.findById(courseId).populate([
      {
        path: "sections",
        model: "Section",
        populate: {
          path: "videos",
          model: "Video",
        },
      },
      {
        path: "instructor",
        select: "firstName lastName avatar createdAt",
        populate: {
          path: "profile",
          select: "about"
        }
      }
    ],);
  
    if(!course) {
      throw new ApiError(404, "Course not found !!")
    }
  
    if(!course.studentsEnrolled.includes(req.user?._id)) {
      throw new ApiError(401, "You are not enrolled in this course !!")
    }
  
    const courseProgress = await CourseProgress.findOne({
      userId: req.user?._id,
      courseId: course._id
    });
  
    if(!courseProgress) {
      throw new ApiError(404, "Cannot fetch course progress")
    }
  
    const ratingAndReview = await RatingAndReview.findOne({
      reviewed : courseId,
      reviewedBy : req.user?._id
    })
  
    return res.status(200).json(
      new ApiResponse(200, {course, courseProgress, ratingAndReview : ratingAndReview || null}, "Course Details Fetched Successfully !!")
    )
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

export {
  createCourse,
  getCoursesByCategory,
  getAllCourses,
  getCourseById,
  getCourseByTitle,
  updateCourse,
  deleteCourse,
  updateCourseThumbnail,
  getRegisteredCourses,
  changeCourseStatus,
  getInstructorRegisteredCourses,
  getCoursePreview,
  getCourseData
};
