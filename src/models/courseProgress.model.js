import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

export const CourseProgress = mongoose.model(
  "CourseProgress",
  courseProgressSchema
);
