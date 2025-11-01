// server/models/Draft.js
import mongoose from 'mongoose';

// Subschema for uploaded attachments (e.g., PDFs, PPTs)
const attachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String },
  resource_type: { type: String },
});

// Subschema for generated quizzes
const quizSchema = new mongoose.Schema({
  title: { type: String },
  questions: [
    {
      qid: String,
      type: { type: String, default: 'mcq' },
      prompt: String,
      options: [String],
      correctAnswer: String,
      marks: { type: Number, default: 1 },
      explanation: String,
    },
  ],
});

// Main Draft schema — used for uploads and AI-generated drafts
const draftSchema = new mongoose.Schema(
  {
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    title: { type: String, required: true },
    sourceText: { type: String },
    attachments: [attachmentSchema],
    notes: { type: String },
    slides: [{ title: String, content: String }],
    quizzes: [quizSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'generated', 'reviewed', 'published'],
      default: 'pending',
    },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

const Draft = mongoose.model('Draft', draftSchema);
export default Draft;
