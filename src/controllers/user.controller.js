import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Profile } from "../models/profile.model.js";
import { DICEBEAR_API_URI } from "../constants.js";
import { generateOTP } from '../utils/otpGenerator.js';
import { OTP } from '../models/otp.model.js';
import { sendMail } from "../utils/mailSender.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Course } from "../models/course.model.js";
import { resetPasswordLink } from "../utils/mail/templates/resetPasswordLink.js";
import { passwordUpdated } from "../utils/mail/templates/passwordUpdated.js";

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
  try {
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
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const register = asyncHandler(async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      otp
    } = req.body;
    let contactNumber = req.body?.contactNumber || null;
    console.log(req.body)
    if (
      [
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        otp
      ].some((field) => !(field.trim()))
    ) {
      throw new ApiError(400, "All fields are are required !!");
    }
  
    console.log(req.body)
    if (password !== confirmPassword) {
      throw new ApiError(400, "Password and confirm password must match !!");
    }
  
    const existingUser = await User.findOne({ email });
  
    if (existingUser) {
      throw new ApiError(409, "Email already exists !!");
    }
  
    const recentOTP = await OTP.find({email}).sort({createdAt: -1}).limit(1);
    console.log(recentOTP);
  
    if(!recentOTP[0]) {
      throw new ApiError(404, "Otp Expired !! Re Generate !!");
    }
    console.log(recentOTP)
    if(otp !== recentOTP[0].otp) {
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
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const login = asyncHandler(async (req, res) => {
  try {
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
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User Logged In Successfully !!"
        )
      );
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
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
  try {
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
      passTokenExpiry: Date.now() + 5*60*1000
    }, {new : true});
  
    if(!updatedDetails) {
      throw new ApiError(500, 'Failed to generate password reset token !!')
    }
  
    const url = `${process.env.FRONTEND_URI}/update-password/${passToken}`;
    await sendMail(email, "Edypros password reset link",
      resetPasswordLink(url)
    )
  
    return res.status(200).json(new ApiResponse(200, {}, "Password reset email sent successfully !!"))
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
})

const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { passToken } =  req.params;
    const { password, confirmPassword } = req.body;
  
    if(!passToken) {
      throw new ApiError(400, "Pass token required to proceed further !!")
    }
  
    if(password !== confirmPassword) {
      throw new ApiError(400, "Password and Confirm password must be equal !!");
    }
  
    const user = await User.findOne({passToken});
  
    if(await user.isPasswordCorrect(password)) {
      throw new ApiError(400, "Password cannot be same as previous password !!")
    }
  
    if(!user) {
      throw new ApiError(404, "Invalid password token !!");
    }
  
    if(user.passTokenExpiry < Date.now()) {
      throw new ApiError(400, "Pass token expired !! Try resetting your password again to generate new !!");
    }
    
    user.password = password;
    await user.save()
  
    // if(!updatedUser) {
    //   throw new ApiError(500, "Failed to save updated password to DB !!");
    // }
  
    await sendMail(user.email, "Edypros Password Updated", passwordUpdated(user.email, user.firstName))
    return res.status(200).json(
      new ApiResponse(200, user, "Password updated successfully !!")
    )
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const changePassword = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
});

const deleteAccount = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user?._id);
    const profile = await Profile.findByIdAndDelete(req.user?.profile);

    // TODO: removing student from registeredCourses
    if(user.accountType === "Student") {
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
    }
    
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, user, "User account deleted successfully !!"));
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, {}, "Error occured while deleting the account !!")
    )
  }
});

const updateAvatar = asyncHandler(async (req, res) => {
  try {
    const avatarLocalPath = req.file?.path;
  
    if(!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing !!");
    }
  
    const avatar = await uploadOnCloudinary(avatarLocalPath);
  
    if(!avatar) {
      throw new ApiError(500, "Error while uploading to cloudinary !!");
    }
  
    const user = await User.findByIdAndUpdate(
      req.user?._id, {
        $set: {
          avatar: avatar.secure_url
        }
      },
      {
        new: true
      }
    ).select("-password -refreshToken");
  
    if(!user) {
      throw new ApiError("Error while uploading to DB !!")
    }
  
    return res.status(200).json(
      new ApiResponse(200, user, "User avatar updated successfully !!")
    )
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
})

const getUserDetails = asyncHandler(async (req, res) => {
  try {
    const userDetails = await User.findById(req.user?._id).select("-password -refreshToken").populate("profile");
  
    if(!userDetails) {
      throw new ApiError(500, "Cannot fetch user data !!")
    }
  
    return res.status(200).json(
      new ApiResponse(200, userDetails, "User details fetched successfully !!")
    )
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
})

const handleForm = asyncHandler(async (req, res) => {
  try {
    const {firstName, lastName, email, contactNumber, message} = req.body;
  
    if(!firstName || !email || !message) {
      throw new ApiError(400, "Name, email and message are required !!");
    }
  
    await sendMail('edypros.owner@gmail.com', "Contact Us Form",
      `<p>Name : ${firstName} ${lastName}<br/>
      Email : ${email}<br/>
      Contact Number : ${contactNumber}<br/></p>
      Dear Admin,
      <p>Message : ${message}</p>`
    )
  
    return res.status(200).json(
      new ApiResponse(200, {}, "Email Sent Successfully !!")
    )
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }
})

export {register, login, logout, refreshAccessToken, generateResetToken, changePassword, resetPassword, deleteAccount, getUserDetails, sendOTP, updateAvatar, handleForm}
