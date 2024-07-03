import { isValidObjectId } from "mongoose";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Profile } from './../models/profile.model.js';

const updateProfile = asyncHandler(async (req, res) => {
    let {firstName,
        lastName,
        contactNumber,
      about,
      gender,
      dob} = req.body;
    
      firstName = firstName || req.user?.firstName;
      lastName = lastName || req.user?.lastName;
      about = about || req.user?.profile?.about;
      contactNumber = contactNumber || req.user?.profile?.contactNumber;
      gender = gender || req.user?.profile?.gender;
      dob = dob || req.user?.profile?.dob;
    
      const profile = await Profile.findByIdAndUpdate(
        req.user?.profile?._id, {
          contactNumber,
          about,
          gender,
          dob
        },
        {new: true}
      )
      const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          firstName,
          lastName,
        },
        {new: true}
      ).populate("profile").select("-password -refreshToken")
    
      req.user = user;
    
      return res.status(200).json(
        new ApiResponse(200, user, "User data updated successfully !!")
      )
});

const upgradeToInstructor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).populate("profile").select("-password -refreshToken");
  if(!user) {
    throw new ApiError(404, "Caanot find user !!");
  }

  user.registeredCourses.forEach( async (courseId) => {
    await Course.findByIdAndUpdate(
      courseId,
      {
        $pull: {
          studentsEnrolled: user._id
        }
      }
    )
  })

  user.registeredCourses = [];
  user.accountType = "Instructor";
  await user.save();
  req.user = user;

  return res.status(200).json(
    new ApiResponse(200, user, "Account upgraded successfully!!")
  )
})

const addToWishlist = asyncHandler(async (req, res) => {
  const {courseId} = req.body;

  if(!courseId) {
    throw new ApiError(400, "Course ID is required !!");
  }

  if(!isValidObjectId) {
    throw new ApiError(404, "Invalid Course ID !!");
  }

  const course = await Course.findById(courseId);

  if(!course) {
    throw new ApiError(404, "Course not found !!")
  }


  const user = await User.findById(req.user?._id);
  if(user.registeredCourses.includes(course._id)) {
    throw new ApiError(403, "Course Already enrolled !!")
  }
  if(user.wishlist.includes(course._id)) {
    throw new ApiError(403, "Course Already in wishlist !!")
  }

  user.wishlist.push(course._id);

  await user.save();

  const wishlist = await User.findById(req.user?._id).select("wishlist").populate({
    path: "wishlist",
    populate: {
      path: "instructor",
      model: "User",
      select: "firstName lastName"
    }
  })
  return res.status(200).json(
    new ApiResponse(200, wishlist, "Course added to wishlist !!")
  )
})

const removeCourseFromWishlist = asyncHandler(async (req, res) => {
  const {courseId} = req.body;

  if(!courseId) {
    throw new ApiError(400, "Course ID is required !!");
  }

  if(!isValidObjectId) {
    throw new ApiError(404, "Invalid Course ID !!");
  }

  const course = await Course.findById(courseId);

  if(!course) {
    throw new ApiError(404, "Course not found !!")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $pull : {
        wishlist: course._id
      }
    },
    {
      new: true
    }
  )

  if(!user) {
    throw new ApiError(500, "Cannot remove course from wishlist !!")
  }
  return res.status(200).json(
    new ApiResponse(200, user.wishlist, "Course remove from wishlist !!")
  )
})

const getWishlistData = asyncHandler(async (req, res) => {
  const wishlist = await User.findById(req.user?._id).select("wishlist").populate({
    path: "wishlist",
    populate: [{
      path: "instructor",
      model: "User",
      select: "firstName lastName"
    },{
      path: "category",
      model: "Category",
      select: "title color"
    }, {
      path: "ratingAndReviews",
      select: "rating"
    }]
  });
  return res.status(200).json(
    new ApiResponse(200, wishlist, "Wishlist Fetched Successfully !!")
  )
})

const getInstructorDashboardData = asyncHandler(async (req, res) => {
  const courses = await Course.find({instructor : req.user?._id, status: "Published"}).populate([
    {
      path: "ratingAndReviews"
    },{
      path: "category"
    }
  ]);

  const draftCourses = await Course.find({instructor : req.user?._id, status: "Draft"}).populate({
    path: "category",
    select: "title color"
  })

  const courseData = courses.map( (course) => {
    const studentsEnrolled = course.studentsEnrolled.length;
    const courseRevenue = studentsEnrolled * course.price;

    return {
      _id : course._id,
      name : course.name,
      description : course.description,
      studentsEnrolled,
      courseRevenue,
      price : course.price,
      category : {
        title : course.category.title,
        color : course.category.color,
      },
      thumbnail : course.thumbnail,
      ratingAndReviews : course.ratingAndReviews
    }
  })
  return res.status(200).json(
    new ApiResponse(200, {publishedCourses : courseData, draftCourses}, "Dashbord data fetched successfully !!")
  )
})

export {updateProfile, upgradeToInstructor, addToWishlist, removeCourseFromWishlist, getWishlistData, getInstructorDashboardData};