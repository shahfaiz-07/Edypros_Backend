import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Category } from './../models/category.model';

const createCategory = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if(!title || !description) {
        throw new ApiError(400, "All fields are required !!");
    }

    const existingCategory = await Category.findOne({category});
    
    if(existingCategory) {
        throw new ApiError(409, 'Category already exists !!');
    }

    const category = await Category.create({
        title, description
    });

    if(!category) {
        throw new ApiError(500, 'Unable to save category to DB !!')
    }

    return res.status(200).json(
        new ApiResponse(200, category, "Category created successfully !!")
    )
});

const deleteCategory = asyncHandler(async (req, res) => {
    const {title} = req.body;
    if(!title) {
        throw new ApiError(400, "Category title is required !!");
    }

    const category = await Category.findOneAndDelete({title});

    if(!category) {
        throw new ApiError(404, "Category doesn't exists !!");
    }

    return res.status(200).json(
        new ApiResponse(200, category, "Category deleted successfully !!")
    )
})

const updateCategory = asyncHandler(async (req, res) => {
    const {title, description} = req.body;
    if(!title || !description) {
        throw new ApiError(400, "All fields are required !!");
    }

    const category = await Category.findOneAndUpdate({title}, {description}, {new:true});

    if(!category) {
        throw new ApiError(404, "Category not found !!");
    }

    return res.status(200).json(
        new ApiResponse(200, category, "Category description updated successfully !!")
    )
})

const getAllCategorys = asyncHandler(async (req, res) => {
    const allCategorys = await Category.find();
    if(!allCategorys) {
        throw new ApiError(500, "Error while fetching category from the DB !!");
    }

    return res.status(200).json(
        new ApiResponse(200, allCategorys, "All tags fetched successfully !!")
    )
})

export { createCategory, deleteCategory, updateCategory, getAllCategorys }