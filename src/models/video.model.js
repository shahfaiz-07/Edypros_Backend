import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    duration: {
        type: String,
        required: true,
        trim: true,
    },
    url: {
        type: String,
        required: true,
    },
    additionalUrl: {
        type: String,
        required: true
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
        required: true,
    }
}, {timestamps: true})

export const Video = mongoose.model("Video", videoSchema)