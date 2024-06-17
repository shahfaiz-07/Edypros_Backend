import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Profile } from './../models/profile.model.js';

const updateProfile = asyncHandler(async (req, res) => {
    const {dob = "",  about="", contactNumber, gender} = req.body

    if(!contactNumber || !gender) {
        throw new ApiError(400, "contact and gender fields are required !!");
    }

    const profile = await Profile.findByIdAndUpdate(req.user?.profile,
        {
            dob,
            about,
            contactNumber,
            gender
        },
        {
            new: true
        }
    ).select("-contactNumber");

    if(!profile) {
        throw new ApiError(500, "Cannot update user profile !!");
    }

    return res.status(200).json(
        new ApiResponse(200, profile, "User profile updated successfully !!")
    )
});

export {updateProfile};