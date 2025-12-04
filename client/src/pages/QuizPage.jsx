// src/pages/QuizPage.jsx
// ------------------------------------------------------
// Student quiz page
// - Loads quiz by id
// - Lets student answer and submit
// - Shows score + per-question feedback
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function QuizPage() {
  const { id } = useParams(); // route: /student/quiz/:id
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); // { qid: answer }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api
      .get(`/api/student/quiz/${id}`)
      .then((res) => {
        if (mounted) setQuiz(res.data);
      })
      .catch((err) => {
        console.error("Failed to load quiz", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleMcqChange = (qid, optionText) => {
    setAnswers((prev) => ({ ...prev, [qid]: optionText }));
  };

  const handleTextChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");

      const payloadAnswers = quiz.questions.map((q) => ({
        qid: q.qid,
        answer: answers[q.qid] ?? "",
      }));

      const res = await api.post(`/api/student/quiz/${quiz._id}/submit`, {
        answers: payloadAnswers,
        userId: user?._id || user?.id || null,
      });

      setResult(res.data);
    } catch (err) {
      alert("Quiz submission failed");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading quiz…</div>;
  }

  if (!quiz) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-red-600">Quiz not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{quiz.title || "Quiz"}</h1>
        <p className="text-xs text-slate-500">
          {quiz.questions?.length || 0} questions
        </p>
      </header>

      <div className="space-y-4">
        {quiz.questions.map((q, idx) => {
          const qResult =
            result?.results?.find((r) => r.qid === q.qid) || null;

          return (
            <div
              key={q.qid}
              className="bg-white rounded shadow-sm p-4 space-y-2"
            >
              <div className="text-sm font-semibold">
                Q{idx + 1}. {q.prompt}
              </div>

              {/* Answer inputs */}
              {q.type === "mcq" ? (
                <div className="space-y-1 text-sm">
                  {q.options?.map((opt, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={q.qid}
                        value={opt}
                        checked={answers[q.qid] === opt}
                        onChange={() => handleMcqChange(q.qid, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  className="w-full border rounded px-2 py-1 text-sm"
                  rows={q.type === "essay" ? 4 : 2}
                  placeholder={
                    q.type === "one-word"
                      ? "Type a single word or short phrase"
                      : "Type your answer"
                  }
                  value={answers[q.qid] || ""}
                  onChange={(e) => handleTextChange(q.qid, e.target.value)}
                />
              )}

              {/* Feedback after submit */}
              {result && qResult && (
                <div className="mt-2 text-xs">
                  {qResult.correct === true && (
                    <span className="text-green-600">
                      ✅ Correct (+{qResult.marksObtained} marks)
                    </span>
                  )}
                  {qResult.correct === false && (
                    <span className="text-red-600">
                      ❌ Incorrect (0 marks)
                    </span>
                  )}
                  {qResult.correct === null && (
                    <span className="text-slate-500">
                      ⏳ Needs manual marking
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit + overall score */}
      <div className="border-t pt-4 flex items-center justify-between">
        <button
          onClick={handleSubmit}
          disabled={submitting || !!result}
          className="bg-primary text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {submitting
            ? "Submitting…"
            : result
            ? "Submitted"
            : "Submit quiz"}
        </button>

        {result && (
          <div className="text-sm">
            Score:{" "}
            <span className="font-bold">
              {result.score}/{result.total}
            </span>{" "}
            (
            {result.total
              ? Math.round((result.score / result.total) * 100)
              : 0}
            %)
          </div>
        )}
      </div>
    </div>
  );
}
