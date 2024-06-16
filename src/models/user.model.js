import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
        index: true
    },
    password: {
        type:String,
        required: true,
    },
    accountType : {
        type: String,
        required: true,
        trim: true,
        enum: ["Admin", "Student", "Instructor"]
    },
    avatar: {
        type: String,
    },
    refreshTokens: {
        type: String, 
    },
    registeredCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ],
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        required: true,
    },
    courseProgress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseProgress"
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    }
}, {timestamps : true})

export const User = mongoose.model("User", userSchema);