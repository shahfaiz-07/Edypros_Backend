import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Profile } from "./../models/profile.model.js";
import { DICEBEAR_API_URI } from "../constants.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
      error
    );
  }
};

const register = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    contactNumber,
    password,
    confirmPassword,
    accountType,
  } = req.body;
  if (
    [
      firstName,
      lastName,
      email,
      contactNumber,
      password,
      confirmPassword,
      accountType,
    ].some((field) => field === "")
  ) {
    throw new ApiError(400, "All fields are are required !!");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Password and confirm password must match !!");
  }

  const existingUser = await User.find({ email });

  if (existingUser) {
    throw new ApiError(409, "Email or username already exists");
  }

  const profile = await Profile.create({
    contactNumber,
    gender: null,
    dob: null,
    about: null,
  });

  if (!profile) {
    throw new ApiError(500, "Unable to create profile !!");
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    accountType,
    avatar: `${DICEBEAR_API_URI}${firstName} ${lastName}`,
    profile: profile._id,
  });

  if (!user) {
    throw new ApiError(500, "Unable to save user information into DB !!");
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the User !!"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully !!"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    throw new ApiError(400, "All Fields are Required !!");
  }

  const user = await User.find({ email });

  if (!user) {
    throw new ApiError(404, "User not found !!");
  }

  const isValidPassword = await user.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid User Credentials !!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged In Successfully !!"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully !!"));
});

export {register, login, logout}
