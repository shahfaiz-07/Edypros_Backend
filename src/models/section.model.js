import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        trim: true,
    },
    sectionOfCourse : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    videos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
} , {timestamps: true});

export const Section = mongoose.model("Section", sectionSchema)