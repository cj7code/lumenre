// controllers/quizController.js
import Quiz from '../models/Quiz.js';

// CREATE QUIZ (admin or AI-generated)
export const createQuiz = async (req, res) => {
  try {
    const { courseId, questions } = req.body;
    const quiz = await Quiz.create({ courseId, questions });
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET QUIZZES FOR COURSE
export const getQuizzesByCourse = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// AUTO-MARK QUIZ
export const markQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const quiz = await Quiz.findById(quizId);

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (q.correctAnswer.toLowerCase() === answers[i].toLowerCase()) {
        score++;
      }
    });

    const percent = (score / quiz.questions.length) * 100;
    res.status(200).json({ score, percent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
