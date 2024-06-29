import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
    unique: true,
  },
  description: {
    type: String
  },
  color: {
    type: String,
    default: "#AF1B3F"
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

export const Category = mongoose.model("Category", categorySchema);

