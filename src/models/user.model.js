import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      required: true,
      trim: true,
      enum: ["Admin", "Student", "Instructor"],
    },
    avatar: {
      type: String,
      required: true,
    },
    registeredCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    courseProgress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseProgress",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
        type: String
    },
    passToken: {
      type: String,
      index: true
    },
    passTokenExpiry: {
      type: Date
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  console.log("Pre middleware of user schema")
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  console.log("Password encrypted")
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      accountType: this.accountType,
      profile: this.profile
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);