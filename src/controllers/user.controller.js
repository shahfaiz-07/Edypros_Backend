import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Profile } from "../models/profile.model.js";
import { DICEBEAR_API_URI } from "../constants.js";
import { generateOTP } from '../utils/otpGenerator.js';
import { OTP } from '../models/otp.model.js';
import { sendMail } from "../utils/mailSender.js";

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

const sendOTP = asyncHandler(async (req, res) => {
  const {email} = req.body;

  let otp = generateOTP()
  let otpPresent = "";
  do {
    otpPresent = await OTP.findOne({otp});
  } while(otpPresent);

  const otpObj = await OTP.create({
    email, otp
  });

  if(!otpObj) {
    throw new ApiError(500, "Some Error Occured while saving OTP to DB !!");
  }

  return res.status(200).json( new ApiResponse(200, {}, "Otp generated successfully !!"))
});

const register = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    contactNumber,
    password,
    confirmPassword,
    accountType,
    otp
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
      otp
    ].some((field) => field === "")
  ) {
    throw new ApiError(400, "All fields are are required !!");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Password and confirm password must match !!");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email already exists !!");
  }

  const recentOTP = await OTP.find({email}).sort({createdAt: -1}).limit(1);
  console.log(recentOTP);

  if(!recentOTP) {
    throw new ApiError(404, "Otp Expired !! Re Generate !!");
  }
  if(otp !== recentOTP.otp) {
    throw new ApiError(400, "Invalid OTP !!");
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
    avatar: `${DICEBEAR_API_URI}${firstName}%20${lastName}`,
    profile: profile._id,
  });

  if (!user) {
    throw new ApiError(500, "Unable to save user information into DB !!");
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ).populate("profile");

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

  const user = await User.findOne({ email });

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
  ).populate("profile");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken)
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

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refeshToken || req.body.refeshToken; // 2nd is for mobile apps
  if (!incomingRefreshToken) {
    throw new ApiError((401, "Unauthorized Request !!"));
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token !!");
    }

    if (incomingRefreshToken !== user?._refreshToken) {
      throw new ApiError(401, "Refresh Token is Expired or Used !!");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access Token Refreshed !!"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token !!");
  }
});

const generateResetToken = asyncHandler(async (req, res) => {
  const {email} = req.body;
  if(!email) {
    throw new ApiError(400, "Email is required !!");
  }
  
  const user = await User.findOne({email});

  if(!user) {
    throw new ApiError(404, "Email is not registered !!");
  }

  const passToken = crypto.randomUUID();

  const updatedDetails = await User.findOneAndUpdate({email}, {
    passToken,
    passTokenExpiry: Date.now() = 5*60*1000
  }, {new : true});

  if(!updatedDetails) {
    throw new ApiError(500, 'Failed to generate password reset token !!')
  }

  const url = `${process.env.FRONTEND_URI}/update-password/${passToken}`;
  await sendMail(email, "Edypros password reset link",
    `<h3>Greetings User,</h3>
    <p>Here is the like to reset your password : ${url}. Ignore this email if you haven't requested it.</p>
    <p>Regards, <br/>Team Edypros.</p>`
  )

  return res.status.json(new ApiResponse(200, {}, "Password reset email sent successfully !!"))
})

const resetPassword = asyncHandler(async (req, res) => {
  const { passToken } =  req.params;
  const { password, confirmPassword } = req.body;

  if(!passToken) {
    throw new ApiError(400, "Pass token required to proceed further !!")
  }

  if(password !== confirmPassword) {
    throw new ApiError(400, "Password and Confirm password must be equal !!");
  }

  const user = await User.findOne({passToken});

  if(!user) {
    throw new ApiError(404, "Invalid password token !!");
  }

  if(user.passTokenExpiry < Date.now()) {
    throw new ApiError(400, "Pass token expired !! Try resetting your password again to generate new !!");
  }

  const updatedUser = await findByIdAndUpdate(user._id, {password}, {new: true});

  if(!updatedUser) {
    throw new ApiError(500, "Failed to save updated password to DB !!");
  }

  return res.status(200).json(
    new ApiResponse(200, )
  )
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  if(!oldPassword || !newPassword || !confirmNewPassword) {
    throw new ApiError(400, "All Fields are required !!");
  }

  if(newPassword !== confirmNewPassword) {
    throw new ApiError(400, "Password and confirmed password must be same !!")
  }

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old Password is Incorrect !!");
  }

  user.password = newPassword;
  await user.save({validateBeforeSave:false});
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully !!"));
});

const deleteAccount = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user?._id);
    const profile = await Profile.findByIdAndDelete(req.user?.profile);

    // TODO: removing student from registeredCourses
    if(user.accountType === "Student") {

    }
    
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User account deleted successfully !!"));
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, {}, "Error occured while deleting the account !!")
    )
  }
});

const getUserDetails = asyncHandler(async (req, res) => {
  const userDetails = await User.findById(req.user?._id).select("-password -refreshToken").populate("profile");

  if(!userDetails) {
    throw new ApiError(500, "Cannot fetch user data !!")
  }

  return res.status(200).json(
    new ApiResponse(200, userDetails, "User details fetched successfully !!")
  )
})

export {register, login, logout, refreshAccessToken, generateResetToken, changePassword, resetPassword, deleteAccount, getUserDetails}
