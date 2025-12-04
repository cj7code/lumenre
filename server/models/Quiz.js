// server/models/Quiz.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    // type of question
    type: {
      type: String,
      enum: ["mcq", "short", "sentence", "matching", "tf", "essay"],
      default: "mcq",
    },

    // Main question text
    prompt: {
      type: String,
      required: true,
      trim: true,
    },

    // For MCQ / True-False
    options: {
      type: [String],
      default: [],
    },

    // Auto-marking where applicable (MCQ/TF/short if you want)
    correctAnswer: {
      type: String,
      default: "",
    },

    // Marks for this question
    marks: {
      type: Number,
      default: 1,
      min: 0,
    },

    // Extra data e.g. for matching pairs
    meta: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
);

const quizSchema = new Schema(
  {
    module: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    questions: {
      type: [questionSchema],
      required: true,
      validate: v => Array.isArray(v) && v.length > 0,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
