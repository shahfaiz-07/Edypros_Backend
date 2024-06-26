import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ??
      req.header("Authorization")?.replace("Bearer ", "");
    
      // console.log("AUTHORIZATION TOKEN ....", token)
    if (!token) {
      throw new ApiError(403, "Unauthorized Request !!");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    ).populate("profile");

    // console.log("AUTHORIZATION USER ...", user)

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

const isStudent = asyncHandler(async (req, _, next) => {
  if (req.user?.accountType !== "Student") {
    throw new ApiError(403, "This is a protected route for students !!");
  }
  next();
});

const isInstructor = asyncHandler(async (req, _, next) => {
    if (req.user?.accountType !== "Instructor") {
        throw new ApiError(403, "This is a protected route for instructors !!");
      }
      next();
})

const isAdmin = asyncHandler(async (req, _, next) => {
    if (req.user?.accountType !== "Admin") {
        throw new ApiError(403, "This is a protected route for admins!!");
      }
      next();
})

export { verifyJWT, isStudent, isInstructor, isAdmin };
