// Attempt.js
import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  qid: { type: String, required: true },
  answer: mongoose.Schema.Types.Mixed,
  correct: { type: Boolean, default: null },
  marksObtained: { type: Number, default: 0 }
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
});

const Attempt = mongoose.model('Attempt', attemptSchema);

export default Attempt;
