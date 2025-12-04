// server/models/QuizAttempt.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const answerSchema = new Schema(
  {
    prompt: String,
    selected: String,
    correctAnswer: String,
    correct: Boolean,
    marksAwarded: Number,
  },
  { _id: false }
);

const quizAttemptSchema = new Schema(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("QuizAttempt", quizAttemptSchema);
