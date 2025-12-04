// server/controllers/quizAttemptController.js
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";

// ------------------------------------------------------
// POST /api/student/quiz/:quizId/submit
// Body: { answers: [ { answer: "..." }, ... ], userId? }
// ------------------------------------------------------
export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers = [], userId } = req.body;

    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "Answers are required" });
    }

    let score = 0;
    let totalMarks = 0;

    const details = quiz.questions.map((q, index) => {
      const type = q.type || "mcq";
      const selected = (answers[index]?.answer ?? "").toString().trim();
      const correctAnswer = (q.correctAnswer ?? "").toString().trim();
      const marks = typeof q.marks === "number" ? q.marks : 1;

      totalMarks += marks;

      let correct = null;
      let marksAwarded = 0;

      if (type === "mcq" || type === "tf") {
        const selNorm = selected.toLowerCase();
        const corrNorm = correctAnswer.toLowerCase();
        correct = selNorm.length > 0 && selNorm === corrNorm;
        if (correct) {
          marksAwarded = marks;
          score += marks;
        }
      } else {
        // short/sentence/matching/essay -> no auto marking
        correct = null;
        marksAwarded = 0;
      }

      return {
        prompt: q.prompt,
        selected,
        correctAnswer,
        correct,
        marksAwarded,
      };
    });

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      user: userId || req.user?.id || req.user?._id || undefined,
      answers: details,
      score,
      totalMarks,
    });

    res.json({
      attemptId: attempt._id,
      score,
      total: totalMarks,
      details,
    });
  } catch (err) {
    console.error("SUBMIT QUIZ ERROR:", err);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
};

// ------------------------------------------------------
// GET /api/student/quiz/:quizId/attempts
// ------------------------------------------------------
export const getAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const filter = { quiz: quizId };

    const userId = req.user?.id || req.user?._id || req.query.userId;
    if (userId) filter.user = userId;

    const attempts = await QuizAttempt.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(attempts);
  } catch (err) {
    console.error("GET ATTEMPTS ERROR:", err);
    res.status(500).json({ error: "Failed to load attempts" });
  }
};
