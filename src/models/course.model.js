import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    learnings: {
      type: String,
      required: true,
      trim: true,
    },
    sections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
      },
    ],
    ratingAndReviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReview",
      },
    ],
    price: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    tags: {
      type: [String]
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft"
    },
    preRequisites: {
      type: [String]
    }
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
