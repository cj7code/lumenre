// tutorQuizController.js
import Quiz from "../models/Quiz.js";
import Module from "../models/Module.js";

export const tutorCreateQuiz = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { questions } = req.body;

    if (!questions) return res.status(400).json({ error: "Missing questions" });

    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ error: "Module not found" });

    const quiz = new Quiz({
      module: moduleId,
      createdBy: req.user._id,
      questions,
      createdAt: new Date(),
    });

    await quiz.save();

    res.json({ message: "Quiz created", quiz });
  } catch (err) {
    console.error("tutorCreateQuiz error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
