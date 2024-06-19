import { Course } from "../models/course.model";
import { User } from "../models/user.model.js";
import { RatingAndReview } from "../models/ratingAndReview.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createRating = asyncHandler(async (req, res) => {
  const { rating, review, reviewed } = req.body;

  if (!rating || !review || !reviewed) {
    throw new ApiError(400, "All feilds are required !!");
  }

  const enrolledStudent = await Course.findOne({
    _id: reviewed,
    studentsEnrolled: { $elemMatch: { $eq: req.user?._id } },
  });

  if (enrolledStudent) {
    throw new ApiError(404, "Student is not enrolled for this course !!");
  }

  const alreadyReviewed = await RatingAndReview.findOne({
    _id: req.user?._id,
    reviewed,
  });

  if (alreadyReviewed) {
    throw new ApiError(403, "Student has already reviewed the course !!");
  }

  const ratingAndReview = await RatingAndReview.create({
    rating,
    review,
    reviewed,
    user: req.user?._id,
  });

  if (!ratingAndReview) {
    throw new ApiError(500, "Cannot create rating and review !!");
  }

  try {
    const course = await Course.findByIdAndUpdate(reviewed, {
        $push: {
            ratingAndReviews: ratingAndReview._id
        }
    });

  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Error while adding rating to course !!"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, ratingAndReview, "Rating created successfully !!")
    );
});

const getAverageRating = asyncHandler(async (req, res) => {
  try {
    const {courseId}=req.body;
    const result= await RatingAndReview.aggregate([
        {
            $match:{
                course:new mongoose.Types.ObjectId(courseId),
            }
        },
        {
            $group:{
                _id:null,
                averageRating: {$avg:"$rating"}
            }
        }
    ]);

    if(result.length > 0) {
        return res.status(200).json({averageRating: result[0].averageRating});
    }
    else{
        return res.status(200).json({message: "Average rating is 0",
    averageRating:0});
    }
    
} catch (error) {
    console.log(error);
    res.status(500).json({message: error.message});
}
});

//generate reviews for all courses to display on homepage based sorted through descending order
const getAllRatingsAndReviews = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const ratingsAndReviews = await RatingAndReview.find({ reviewed: courseId });

  if(!ratingsAndReviews) {
    throw new ApiError(404, "No ratings and reviews found !!");
  }

  return res.status(200).json(
    new ApiResponse(200, ratingsAndReviews, "Ratings and  Reviews data fetched successfully !!")
  )
});

export {createRating, getAverageRating, getAllRatingsAndReviews};
