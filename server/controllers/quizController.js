// server/controllers/quizController.js
import Quiz from "../models/Quiz.js";
import Module from "../models/Module.js";

// ------------------------------------------------------
// Admin / Tutor: create quiz for a module
// POST /api/admin/modules/:moduleId/quizzes
// Body: { title, questions: [ { type, prompt|question, options[], correctAnswer, marks, meta } ] }
// ------------------------------------------------------
export const createQuizForModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one question is required" });
    }

    const normalizedQuestions = questions.map((q, index) => {
      const type = q.type || "mcq";

      const text =
        (q.prompt ?? q.question ?? "").toString().trim() ||
        `Question ${index + 1}`;

      let options = Array.isArray(q.options)
        ? q.options.filter(Boolean)
        : [];

      // For True/False, force options if not given
      if (type === "tf" && options.length === 0) {
        options = ["True", "False"];
      }

      return {
        type,
        prompt: text,
        options: type === "mcq" || type === "tf" ? options : [],
        correctAnswer: q.correctAnswer ?? "",
        marks:
          typeof q.marks === "number" && q.marks > 0 ? q.marks : 1,
        meta: q.meta || null,
      };
    });

    const quiz = await Quiz.create({
      module: moduleId,
      title: (title || "Untitled Quiz").toString().trim(),
      questions: normalizedQuestions,
      createdBy: req.user?.id || req.user?._id || undefined,
    });

    // Attach quiz to module.quizzes[]
    await Module.findByIdAndUpdate(
      moduleId,
      { $addToSet: { quizzes: quiz._id } },
      { new: true }
    );

    res.status(201).json(quiz);
  } catch (err) {
    console.error("CREATE QUIZ ERROR:", err);
    res.status(500).json({ error: "Failed to create quiz" });
  }
};

// ------------------------------------------------------
// GET one quiz by id
// - Used by /api/student/quiz/:quizId and /api/quizzes/:quizId
// ------------------------------------------------------
export const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId)
      .populate("module", "title")
      .lean();

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json(quiz);
  } catch (err) {
    console.error("GET QUIZ ERROR:", err);
    res.status(500).json({ error: "Failed to load quiz" });
  }
};

// ------------------------------------------------------
// GET /api/quizzes?moduleId=xxxx
//  - Used by QuizListPage (all quizzes)
//  - Used by QuizBuilder to list quizzes for a module
// ------------------------------------------------------
export const listQuizzes = async (req, res) => {
  try {
    const { moduleId } = req.query;
    const filter = moduleId ? { module: moduleId } : {};

    const quizzes = await Quiz.find(filter)
      .populate("module", "title")
      .sort({ createdAt: -1 })
      .lean();

    res.json(quizzes);
  } catch (err) {
    console.error("LIST QUIZZES ERROR:", err);
    res.status(500).json({ error: "Failed to load quizzes" });
  }
};

// ------------------------------------------------------
// PUT /api/admin/quizzes/:quizId
// Admin/Tutor: update quiz (title + questions)
// ------------------------------------------------------
export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one question is required" });
    }

    const normalizedQuestions = questions.map((q, index) => {
      const type = q.type || "mcq";
      const text =
        (q.prompt ?? q.question ?? "").toString().trim() ||
        `Question ${index + 1}`;

      let options = Array.isArray(q.options)
        ? q.options.filter(Boolean)
        : [];

      if (type === "tf" && options.length === 0) {
        options = ["True", "False"];
      }

      return {
        type,
        prompt: text,
        options: type === "mcq" || type === "tf" ? options : [],
        correctAnswer: q.correctAnswer ?? "",
        marks:
          typeof q.marks === "number" && q.marks > 0 ? q.marks : 1,
        meta: q.meta || null,
      };
    });

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      {
        title: (title || "Untitled Quiz").toString().trim(),
        questions: normalizedQuestions,
      },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json(quiz);
  } catch (err) {
    console.error("UPDATE QUIZ ERROR:", err);
    res.status(500).json({ error: "Failed to update quiz" });
  }
};

// ------------------------------------------------------
// DELETE /api/admin/quizzes/:quizId
//  - Remove quiz
//  - Pull from module.quizzes[]
// ------------------------------------------------------
export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByIdAndDelete(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    await Module.updateMany(
      { quizzes: quizId },
      { $pull: { quizzes: quizId } }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE QUIZ ERROR:", err);
    res.status(500).json({ error: "Failed to delete quiz" });
  }
};