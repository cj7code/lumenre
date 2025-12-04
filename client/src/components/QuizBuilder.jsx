// src/components/QuizBuilder.jsx
// -------------------------------------------------------------------
// QuizBuilder
//  ✓ Create quiz for a module (admin / tutor)
//  ✓ Question types: mcq, short, sentence, matching, tf, essay
//  ✓ Bottom-right "Add question" button
//  ✓ List existing quizzes for this module (edit / delete)
// -------------------------------------------------------------------

import { useEffect, useState } from "react";
import api from "../api";

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice" },
  { value: "short", label: "Short Answer" },
  { value: "sentence", label: "Sentence Completion" },
  { value: "matching", label: "Matching Items" },
  { value: "tf", label: "True / False" },
  { value: "essay", label: "Essay Question" },
];

function emptyQuestion(type = "mcq") {
  return {
    type,
    prompt: "",
    options:
      type === "mcq" || type === "tf" ? ["", "", "", ""] : [],
    correctAnswer: "",
    marks: 1,
    meta: null,
  };
}

export default function QuizBuilder({
  moduleId,
  basePath = "/api/admin", // for tutor you can pass "/api/tutor"
}) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion("mcq")]);
  const [saving, setSaving] = useState(false);

  // quiz list for this module
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);

  // Load quizzes for this module
  useEffect(() => {
    if (!moduleId) return;
    loadQuizzes();
  }, [moduleId]);

  const loadQuizzes = async () => {
    setLoadingQuizzes(true);
    try {
      const res = await api.get("/api/quizzes", {
        params: { moduleId },
      });
      setQuizzes(res.data || []);
    } catch (err) {
      console.error("Failed to load quizzes", err);
    }
    setLoadingQuizzes(false);
  };

  // ---------- question helpers ----------
  const updateQuestion = (index, patch) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  };

  const changeType = (index, newType) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const old = copy[index];
      copy[index] = {
        ...emptyQuestion(newType),
        prompt: old.prompt,
        marks: old.marks,
      };
      return copy;
    });
  };

  const changeOption = (qIndex, optIndex, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      const opts = [...(q.options || [])];
      opts[optIndex] = value;
      q.options = opts;
      copy[qIndex] = q;
      return copy;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion("mcq")]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- save quiz ----------
  const handleSave = async () => {
    if (!moduleId) {
      return alert("Please select a module first.");
    }
    if (!title.trim()) {
      return alert("Quiz title is required.");
    }

    const validQuestions = questions.filter((q) =>
      (q.prompt || "").toString().trim()
    );

    if (validQuestions.length === 0) {
      return alert("At least one question with a prompt is required.");
    }

    const payload = {
      title,
      questions: validQuestions,
    };

    setSaving(true);
    try {
      if (editingQuizId) {
        // update existing quiz
        await api.put(`${basePath}/quizzes/${editingQuizId}`, payload);
        alert("Quiz updated.");
      } else {
        // create new quiz
        await api.post(
          `${basePath}/modules/${moduleId}/quizzes`,
          payload
        );
        alert("Quiz created.");
      }

      // reset builder state
      setEditingQuizId(null);
      setTitle("");
      setQuestions([emptyQuestion("mcq")]);
      loadQuizzes();
    } catch (err) {
      console.error("Quiz save error", err);
      alert("Failed to save quiz");
    }
    setSaving(false);
  };

  // ---------- load quiz into builder for editing ----------
  const startEdit = (quiz) => {
    setEditingQuizId(quiz._id);
    setTitle(quiz.title || "");
    setQuestions(
      (quiz.questions || []).map((q) => ({
        type: q.type || "mcq",
        prompt: q.prompt || "",
        options: q.options || [],
        correctAnswer: q.correctAnswer || "",
        marks: q.marks || 1,
        meta: q.meta || null,
      }))
    );
  };

  // ---------- delete quiz ----------
  const handleDelete = async (quizId) => {
    if (!window.confirm("Delete this quiz permanently?")) return;
    try {
      await api.delete(`${basePath}/quizzes/${quizId}`);
      if (editingQuizId === quizId) {
        setEditingQuizId(null);
        setTitle("");
        setQuestions([emptyQuestion("mcq")]);
      }
      loadQuizzes();
    } catch (err) {
      console.error("Delete quiz error", err);
      alert("Failed to delete quiz");
    }
  };

  // ---------- UI ----------
  return (
    <section className="p-6 bg-white shadow rounded space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Quiz Builder</h2>
          <p className="text-xs text-slate-500">
            Attach a quiz to this module. Students will see it in their
            module view.
          </p>
        </div>
        {editingQuizId && (
          <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700">
            Editing existing quiz
          </span>
        )}
      </div>

      {/* Quiz title */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Quiz Title</label>
        <input
          type="text"
          className="border rounded px-3 py-2 w-full text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Muscular System: MCQ Test"
        />
      </div>

      {/* Questions */}
      <div className="space-y-4 relative">
        {questions.map((q, index) => {
          const type = q.type || "mcq";
          return (
            <div
              key={index}
              className="border rounded-lg p-4 bg-slate-50 space-y-3"
            >
              <div className="flex justify-between items-center gap-3">
                <h3 className="text-sm font-semibold">
                  Question {index + 1}
                </h3>
                <div className="flex items-center gap-2">
                  <select
                    value={type}
                    onChange={(e) =>
                      changeType(index, e.target.value)
                    }
                    className="border rounded px-2 py-1 text-xs"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={0}
                    className="w-16 border rounded px-1 py-1 text-xs"
                    value={q.marks}
                    onChange={(e) =>
                      updateQuestion(index, {
                        marks: Number(e.target.value) || 0,
                      })
                    }
                    title="Marks"
                  />

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-xs text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Prompt */}
              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Question prompt
                </label>
                <textarea
                  className="w-full border rounded px-2 py-1 text-sm"
                  rows={2}
                  value={q.prompt}
                  onChange={(e) =>
                    updateQuestion(index, { prompt: e.target.value })
                  }
                  placeholder="Enter the question text here..."
                />
              </div>

              {/* Type-specific config */}
              {type === "mcq" && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">
                    Multiple choice options
                  </p>
                  {[0, 1, 2, 3].map((optIndex) => (
                    <div
                      key={optIndex}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={
                          q.correctAnswer ===
                          (q.options?.[optIndex] || "")
                        }
                        onChange={() =>
                          updateQuestion(index, {
                            correctAnswer:
                              q.options?.[optIndex] || "",
                          })
                        }
                      />
                      <input
                        type="text"
                        className="flex-1 border rounded px-2 py-1 text-sm"
                        value={q.options?.[optIndex] || ""}
                        onChange={(e) =>
                          changeOption(index, optIndex, e.target.value)
                        }
                        placeholder={`Option ${optIndex + 1}`}
                      />
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-500">
                    Select the radio button for the correct option.
                  </p>
                </div>
              )}

              {type === "tf" && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">True / False</p>
                  {["True", "False"].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={q.correctAnswer === opt}
                        onChange={() =>
                          updateQuestion(index, {
                            correctAnswer: opt,
                            options: ["True", "False"],
                          })
                        }
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {(type === "short" ||
                type === "sentence" ||
                type === "matching" ||
                type === "essay") && (
                <div className="space-y-1">
                  <label className="text-xs font-medium">
                    Expected / model answer (optional)
                  </label>
                  <textarea
                    className="w-full border rounded px-2 py-1 text-sm"
                    rows={type === "essay" ? 3 : 2}
                    value={q.correctAnswer}
                    onChange={(e) =>
                      updateQuestion(index, {
                        correctAnswer: e.target.value,
                      })
                    }
                    placeholder="You can leave this blank if you'll mark manually."
                  />
                  {type === "matching" && (
                    <p className="text-[11px] text-slate-500">
                      You can describe pairs here, e.g. A–1, B–2, C–3.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Question button bottom-right */}
        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-teal-600 text-white text-xs shadow hover:bg-teal-700"
          >
            + Add Question
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving || !moduleId}
          className="bg-primary text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {saving
            ? "Saving…"
            : editingQuizId
            ? "Update Quiz"
            : "Save Quiz"}
        </button>
      </div>

      {/* Existing quizzes for this module */}
      <div className="pt-4 border-t space-y-2">
        <h3 className="text-sm font-semibold">
          Existing quizzes for this module
        </h3>
        {loadingQuizzes ? (
          <p className="text-xs text-slate-500">Loading…</p>
        ) : quizzes.length === 0 ? (
          <p className="text-xs text-slate-500">
            No quizzes yet for this module.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {quizzes.map((qz) => (
              <li
                key={qz._id}
                className="flex justify-between items-center border rounded px-3 py-2 bg-slate-50"
              >
                <div>
                  <p className="font-medium">{qz.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {qz.questions?.length || 0} questions ·{" "}
                    {new Date(qz.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-xs px-3 py-1 rounded bg-slate-200"
                    onClick={() => startEdit(qz)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs px-3 py-1 rounded bg-red-600 text-white"
                    onClick={() => handleDelete(qz._id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
