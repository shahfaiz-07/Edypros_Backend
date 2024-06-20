import mongoose from "mongoose";

const ratingAndReviewSchema = new mongoose.Schema({
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: {
        type: Number,
        required: true
    },
    review: {
        type: String,
        default: "",
        trim: true,
    },
    reviewed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }
}, {timestamps: true});

export const RatingAndReview = mongoose.model("RatingAndReview", ratingAndReviewSchema)