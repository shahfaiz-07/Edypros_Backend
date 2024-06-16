import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        trim: true,
    },
    videos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    }
} , {timestamps: true});

export const Section = mongoose.model("Section", sectionSchema)