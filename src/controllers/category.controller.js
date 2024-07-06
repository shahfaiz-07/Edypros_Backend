import { Course } from "../models/course.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Category } from "./../models/category.model.js";

const createCategory = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      throw new ApiError(400, "All fields are required !!");
    }
  
    const existingCategory = await Category.findOne({ title });
  
    if (existingCategory) {
      throw new ApiError(409, "Category already exists !!");
    }
  
    const category = await Category.create({
      title,
      description,
    });
  
    if (!category) {
      throw new ApiError(500, "Unable to save category to DB !!");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, category, "Category created successfully !!"));
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      throw new ApiError(400, "Category title is required !!");
    }
  
    const category = await Category.findOneAndDelete({ title });
  
    if (!category) {
      throw new ApiError(404, "Category doesn't exists !!");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, category, "Category deleted successfully !!"));
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      throw new ApiError(400, "All fields are required !!");
    }
  
    const category = await Category.findOneAndUpdate(
      { title },
      { description },
      { new: true }
    );
  
    if (!category) {
      throw new ApiError(404, "Category not found !!");
    }
  
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          category,
          "Category description updated successfully !!"
        )
      );
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const getAllCategorys = asyncHandler(async (req, res) => {
  try {
    const allCategorys = await Category.find().select("title");
    if (!allCategorys) {
      throw new ApiError(500, "Error while fetching category from the DB !!");
    }
  
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          allCategorys,
          "All categories fetched successfully !!"
        )
      );
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const getCategoryPageDetails = asyncHandler(async (req, res) => {
  try {
    const { categoryId } = req.params;
  
    const courses = await Category.findById(categoryId).populate({
      path: "courses",
      match: { status: "Published" },
      populate: [
        {
          path: "instructor",
          model: "User",
          select: "firstName lastName",
        },
        {
          path: "ratingAndReviews",
        },
      ],
    });
  
    const newCourses = await Course.find({ category: categoryId })
      .sort({ createdAt: -1 })
      .populate([{
        path: "instructor",
        select: "firstName lastName",
      }, {
        path: "ratingAndReviews"
      }]);
  
    if (!courses) {
      throw new ApiError(404, "Data not found !!");
    }
  
    const differentCategory = await Category.aggregate([
      { $match: { _id: { $ne: categoryId } } }, // Exclude the given categoryId
      {
        $lookup: {
          from: "courses",
          localField: "courses",
          foreignField: "_id",
          as: "coursesData",
        },
      },
      {
        $match: {
          "coursesData.status": "Published",
          "coursesData.0": { $exists: true },
        },
      },
      { $sample: { size: 1 } }, // Randomly select one category
    ]);
  
    const differentCategoryData = await Category.findById(
      differentCategory[0]._id
    ).populate({
      path: "courses",
      match: { status: "Published" },
      populate: [
        {
          path: "instructor",
          model: "User",
          select: "firstName lastName",
        },
        {
          path: "ratingAndReviews",
        },
      ],
    });
  
    const topSellers = await Course.aggregate([
      {
        $match: {
          status: "Published",
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          learnings: 1,
          sections: 1,
          price: 1,
          ratingAndReviews: 1,
          studentsEnrolled: 1,
          thumbnail: 1,
          category: 1,
          instructor: 1,
          length: { $size: "$studentsEnrolled" },
        },
      },
      {
        $sort: { length: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },{
        $lookup: {
          from: "ratingandreviews",
          localField: "ratingAndReviews",
          foreignField: "_id",
          as: "ratingAndReviews",
        }
      },
      {
        $lookup: {
          from: "users", // The name of the instructor collection
          localField: "instructor", // The field in the Course collection
          foreignField: "_id", // The field in the Instructor collection
          as: "instructor", // The name of the output array field
        },
      },
      {
        $unwind: "$instructor", // Deconstructs the array to output a single object
      },
      {
        $project: {
          name: 1,
          description: 1,
          learnings: 1,
          sections: 1,
          price: 1,
          ratingAndReviews: 1,
          studentsEnrolled: 1,
          thumbnail: 1,
          category: {
            title: 1,
            color: 1
          },
          length: 1,
          instructor: {
            firstName: 1,
            lastName: 1,
          },
        },
      },
    ]);
  
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { courses, newCourses, differentCategoryData, topSellers },
          "Category Page data fetched sucessfully !!"
        )
      );
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

export {
  createCategory,
  deleteCategory,
  updateCategory,
  getAllCategorys,
  getCategoryPageDetails,
};
