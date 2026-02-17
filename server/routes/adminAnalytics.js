// ============================================================================
// ADMIN ANALYTICS ROUTES
// ----------------------------------------------------------------------------
// Features:
// ✔ Overview metrics
// ✔ Quiz performance analytics
// ✔ Export ALL quiz results (CSV)
// ✔ Export SELECTED quiz results (CSV)
// ✔ Safe calculations (no divide-by-zero)
// ✔ Staff protected routes
// ============================================================================

import express from "express";
import mongoose from "mongoose";
import QuizAttempt from "../models/QuizAttempt.js";
import Quiz from "../models/Quiz.js";
import Module from "../models/Module.js";
import User from "../models/User.js";
import { staffAuth } from "../middleware/staffAuth.js";
import { Parser } from "json2csv";

const router = express.Router();

/**
 * ============================================================================
 * GET /api/admin/analytics
 * Optional Query:
 *   ?moduleId=xxxxx
 * 
 * Returns:
 *   - Overview metrics
 *   - Quiz performance breakdown
 * ============================================================================
 */
router.get("/analytics", staffAuth, async (req, res) => {
  try {
    const { moduleId } = req.query;

    // Optional filtering by module
    const quizFilter = moduleId ? { module: moduleId } : {};

    const quizzes = await Quiz.find(quizFilter).select("_id");
    const quizIds = quizzes.map(q => q._id);

    const attemptFilter = quizIds.length
      ? { quiz: { $in: quizIds } }
      : {};

    // Basic counts
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalModules = await Module.countDocuments();
    const totalQuizzes = await Quiz.countDocuments(quizFilter);
    const totalQuizAttempts = await QuizAttempt.countDocuments(attemptFilter);

    // Average score across all attempts
    const avgScoreAgg = await QuizAttempt.aggregate([
      { $match: attemptFilter },
      { $group: { _id: null, avg: { $avg: "$score" } } }
    ]);

    const avgQuizScore = avgScoreAgg[0]?.avg || 0;

    // Pass rate (>= 70%)
    const passAgg = await QuizAttempt.aggregate([
      { $match: attemptFilter },
      {
        $group: {
          _id: null,
          passRate: {
            $avg: { $cond: [{ $gte: ["$score", 70] }, 1, 0] }
          }
        }
      }
    ]);

    const completionRate = passAgg[0]
      ? Math.round(passAgg[0].passRate * 100)
      : 0;

    // Quiz performance table
    const quizPerformance = await QuizAttempt.aggregate([
      { $match: attemptFilter },
      {
        $group: {
          _id: "$quiz",
          attempts: { $sum: 1 },
          avgScore: { $avg: "$score" },
          bestScore: { $max: "$score" },
          lowestScore: { $min: "$score" },
          totalMarks: { $max: "$totalMarks" }
        }
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "_id",
          as: "quiz"
        }
      },
      {
        $project: {
          quizTitle: { $arrayElemAt: ["$quiz.title", 0] },
          attempts: 1,
          bestScore: 1,
          lowestScore: 1,
          avgScore: { $round: ["$avgScore", 1] },
          avgScorePercent: {
            $cond: [
              { $gt: ["$totalMarks", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$avgScore", "$totalMarks"] },
                      100
                    ]
                  },
                  1
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { attempts: -1 } }
    ]);

    res.json({
      overview: {
        totalStudents,
        totalModules,
        totalQuizzes,
        totalQuizAttempts,
        avgQuizScore: Math.round(avgQuizScore * 10) / 10,
        completionRate
      },
      quizPerformance,
      generatedAt: new Date()
    });

  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Analytics failed" });
  }
});

/**
 * ============================================================================
 * GET /api/admin/export/quiz-results
 * 
 * Optional Query:
 *   ?quizId=xxxx
 * 
 * Behavior:
 *   - If quizId provided → export ONLY that quiz
 *   - If not provided → export ALL quizzes
 * 
 * Returns:
 *   CSV file (Excel compatible)
 * ============================================================================
 */
router.get("/export/quiz-results", staffAuth, async (req, res) => {
  try {
    const { quizId } = req.query;

    let matchStage = {};

    // 🔑 Convert quizId to ObjectId safely
    if (quizId) {
      if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }

      matchStage = {
        quiz: new mongoose.Types.ObjectId(quizId)
      };
    }

    const attempts = await QuizAttempt.aggregate([
      { $match: matchStage },

      // Join student

      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "quiz",
          foreignField: "_id",
          as: "quiz"
        }
      },
      {
        $project: {
          "Student Name": { $arrayElemAt: ["$user.name", 0] },
          "Email": { $arrayElemAt: ["$user.email", 0] },
          "Quiz Title": { $arrayElemAt: ["$quiz.title", 0] },
          "Score": "$score",
          "Total Marks": "$totalMarks",
          "Percentage": {
            $cond: [
              { $gt: ["$totalMarks", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$score", "$totalMarks"] },
                      100
                    ]
                  },
                  1
                ]
              },
              0
            ]
          },
          "Passed": {
            $cond: [
              {
                $gte: [
                  {
                    $multiply: [
                      { $divide: ["$score", "$totalMarks"] },
                      100
                    ]
                  },
                  50
                ]
              },
              "Yes",
              "No"
            ]
          },
          "Attempt Date": {
            $dateToString: {
              format: "%Y-%m-%d %H:%M",
              date: "$createdAt"
            }
          }
        }
      }

    ]);

    // Prevent json2csv crash if no results
    if (!attempts.length) {
      return res.status(404).json({
        message: "No attempts found for this quiz"
      });
    }

    const parser = new Parser();
    const csv = parser.parse(attempts);

    res.header("Content-Type", "text/csv");
    res.header(
      "Content-Disposition",
      `attachment; filename=${
        quizId ? "selected-quiz-results.csv" : "all-quiz-results.csv"
      }`
    );

    res.send(csv);

  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ message: "Export failed" });
  }
});

export default router;
