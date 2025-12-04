// src/pages/StudentQuiz.jsx
// -------------------------------------------------------------------
// Student quiz-taking UI:
//   ✓ Loads quiz via /api/student/quiz/:quizId
//   ✓ Renders different question types
//   ✓ Submits answers array [{ answer }]
//   ✓ Shows overall score
// -------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function StudentQuiz() {
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]); // index-based
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api
      .get(`/api/student/quiz/${quizId}`)
      .then((res) => {
        if (!mounted) return;
        setQuiz(res.data);
        const initial = (res.data.questions || []).map(() => "");
        setAnswers(initial);
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
  }, [quizId]);

  const updateAnswer = (index, value) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const submit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/api/student/quiz/${quizId}/submit`, {
        answers: answers.map((a) => ({ answer: a })),
      });
      setResult(res.data);
    } catch (err) {
      console.error("Submit failed", err);
      alert("Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading quiz…</p>;
  if (!quiz) return <p className="p-6 text-red-600">Quiz not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <p className="text-xs text-slate-500">
          {quiz.questions?.length || 0} questions
        </p>
      </header>

      {/* RESULT BOX */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded p-4 space-y-2">
          <p className="font-semibold text-green-700">
            Quiz submitted successfully
          </p>
          <p className="text-sm">
            Score:{" "}
            <span className="font-bold">
              {result.score}/{result.total}
            </span>{" "}
            (
            {result.total
              ? Math.round((result.score / result.total) * 100)
              : 0}
            %)
          </p>
        </div>
      )}

      {/* QUESTIONS */}
      <div className="space-y-4">
        {quiz.questions.map((q, index) => {
          const type = q.type || "mcq";
          const answer = answers[index] ?? "";

          return (
            <div
              key={index}
              className="bg-white rounded shadow-sm p-4 space-y-3"
            >
              <div className="text-sm font-semibold">
                Q{index + 1}. {q.prompt}
                <span className="ml-2 text-xs text-slate-500">
                  ({typeLabel(type)}, {q.marks || 1} mark
                  {q.marks > 1 ? "s" : ""})
                </span>
              </div>

              {/* MCQ */}
              {type === "mcq" && (
                <div className="space-y-1 text-sm">
                  {q.options?.map((opt, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`q-${index}`}
                        value={opt}
                        checked={answer === opt}
                        onChange={() => updateAnswer(index, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* TRUE / FALSE */}
              {type === "tf" && (
                <div className="space-y-1 text-sm">
                  {["True", "False"].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`q-${index}`}
                        value={opt}
                        checked={answer === opt}
                        onChange={() => updateAnswer(index, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* SHORT / SENTENCE / MATCHING / ESSAY → textarea */}
              {(type === "short" ||
                type === "sentence" ||
                type === "matching" ||
                type === "essay") && (
                <textarea
                  className="w-full border rounded px-2 py-1 text-sm"
                  rows={type === "essay" ? 4 : 2}
                  value={answer}
                  onChange={(e) => updateAnswer(index, e.target.value)}
                  placeholder={
                    type === "short"
                      ? "Short answer..."
                      : type === "sentence"
                      ? "Complete the sentence..."
                      : type === "matching"
                      ? "Write your matching pairs..."
                      : "Write your essay answer..."
                  }
                />
              )}
            </div>
          );
        })}
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={submit}
          disabled={submitting}
          className="bg-primary text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {submitting
            ? "Submitting…"
            : result
            ? "Resubmit Quiz"
            : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}

function typeLabel(type) {
  switch (type) {
    case "mcq":
      return "Multiple choice";
    case "short":
      return "Short answer";
    case "sentence":
      return "Sentence completion";
    case "matching":
      return "Matching";
    case "tf":
      return "True/False";
    case "essay":
      return "Essay";
    default:
      return "Question";
  }
}
