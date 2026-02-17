// ============================================================================
// ADMIN ANALYTICS PAGE
// ----------------------------------------------------------------------------
// Features:
// ✔ Overview dashboard
// ✔ Quiz performance table
// ✔ Export ALL quizzes
// ✔ Export SELECTED quiz
// ✔ Safe rendering
// ✔ Clean UI
// ============================================================================

import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");

  useEffect(() => {
    loadAnalytics();
    loadQuizzes();
  }, []);

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      const res = await api.get("/api/admin/analytics");
      setAnalytics(res.data);
    } catch (err) {
      console.error("Analytics failed");
    } finally {
      setLoading(false);
    }
  };

  // Load quizzes for dropdown
  const loadQuizzes = async () => {
    try {
      const res = await api.get("/api/quizzes");
      setQuizzes(res.data);
    } catch (err) {
      console.error("Quiz load failed");
    }
  };

  // Export function (All or Selected)
  const exportCSV = async (quizId = null) => {
    const url = quizId
      ? `/api/admin/export/quiz-results?quizId=${quizId}`
      : "/api/admin/export/quiz-results";

    const res = await api.get(url, { responseType: "blob" });

    const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = quizId
      ? "selected-quiz-results.csv"
      : "all-quiz-results.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) return <div className="p-10">Loading...</div>;
  if (!analytics) return <div className="p-10 text-red-500">Failed to load analytics</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <Link to="/admin" className="underline text-sm">← Back</Link>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard label="Students" value={analytics.overview.totalStudents} />
        <StatCard label="Completion Rate" value={`${analytics.overview.completionRate}%`} />
        <StatCard label="Average Score" value={`${analytics.overview.avgQuizScore}%`} />
      </div>

      {/* Quiz Performance Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Quiz Performance</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Quiz</th>
              <th>Attempts</th>
              <th>Avg %</th>
              <th>Best</th>
              <th>Lowest</th>
            </tr>
          </thead>
          <tbody>
            {analytics.quizPerformance.map((quiz, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{quiz.quizTitle}</td>
                <td>{quiz.attempts}</td>
                <td>{quiz.avgScorePercent}%</td>
                <td>{quiz.bestScore}</td>
                <td>{quiz.lowestScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Section */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Export Quiz Scores</h2>

        <div className="flex gap-4 flex-wrap items-center">

          <select
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Quiz</option>
            {quizzes.map((quiz) => (
              <option key={quiz._id} value={quiz._id}>
                {quiz.title}
              </option>
            ))}
          </select>

          <button
            disabled={!selectedQuiz}
            onClick={() => exportCSV(selectedQuiz)}
            className={`px-4 py-2 rounded text-white ${
              selectedQuiz
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Export Selected Quiz
          </button>

          <button
            onClick={() => exportCSV()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Export All Quizzes
          </button>

        </div>
      </div>

    </div>
  );
}

// Simple reusable stat card
function StatCard({ label, value }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}
