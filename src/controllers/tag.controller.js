import { Tag } from "../models/tags.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTag = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if(!title || !description) {
        throw new ApiError(400, "All fields are required !!");
    }

    const existingTag = await Tag.findOne({tag});
    
    if(existingTag) {
        throw new ApiError(409, 'Tag already exists !!');
    }

    const tag = await Tag.create({
        title, description
    });

    if(!tag) {
        throw new ApiError(500, 'Unable to save tag to DB !!')
    }

    return res.status(200).json(
        new ApiResponse(200, tag, "Tag created successfully !!")
    )
});

const deleteTag = asyncHandler(async (req, res) => {
    const {title} = req.body;
    if(!title) {
        throw new ApiError(400, "Tag title is required !!");
    }

    const tag = await Tag.findOneAndDelete({title});

    if(!tag) {
        throw new ApiError(404, "Tag doesn't exists !!");
    }

    return res.status(200).json(
        new ApiResponse(200, tag, "Tag deleted successfully !!")
    )
})

const updateTag = asyncHandler(async (req, res) => {
    const {title, description} = req.body;
    if(!title || !description) {
        throw new ApiError(400, "All fields are required !!");
    }

    const tag = await Tag.findOneAndUpdate({title}, {description}, {new:true});

    if(!tag) {
        throw new ApiError(404, "Tag not found !!");
    }

    return res.status(200).json(
        new ApiResponse(200, tag, "Tag description updated successfully !!")
    )
})

const getAllTags = asyncHandler(async (req, res) => {
    const allTags = await Tag.find();
    if(!allTags) {
        throw new ApiError(500, "Error while fetching tag from the DB !!");
    }

    return res.status(200).json(
        new ApiResponse(200, allTags, "All tags fetched successfully !!")
    )
})

export { createTag, deleteTag, updateTag, getAllTags }