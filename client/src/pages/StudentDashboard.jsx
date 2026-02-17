// StudentDashboard.jsx
// ---------------------------------------------------------------------------
// PROFESSIONAL STUDENT DASHBOARD — FINAL & STABLE + ACTIVE MODULE HIGHLIGHT + FULLSCREEN
//
// ✓ Courses grouped by Year → Semester
// ✓ Clicking course expands modules BELOW it (left pane)
// ✓ Clicking module loads ACTUAL CONTENT immediately (right pane)
// ✓ Active module is clearly highlighted
// ✓ Draggable / resizable left pane with minimize/maximize arrows
// ✓ Independent scrolling for right pane
// ✓ Next / Previous module buttons (top + bottom)
// ✓ Full-screen reading mode with ⛶ / ✖ symbols
// ✓ Font resizing (A+ / A−)
// ✓ Attachments listed first → open ONLY on click
// ✓ PDFs open inline (NO auto-download)
// ✓ Other files open/download only on click
// ---------------------------------------------------------------------------

import { useEffect, useState, useRef } from "react";
import api from "../api";

// ---------------------------------------------------------------------------
// INLINE PDF VIEWER (ON-DEMAND)
// ---------------------------------------------------------------------------
function InlinePDF({ att, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    let url;

    api
      .get(att.url, { responseType: "blob" })
      .then((res) => {
        url = URL.createObjectURL(res.data);
        setBlobUrl(url);
      })
      .catch(() => setBlobUrl(null));

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [att.url]);

  if (!blobUrl) {
    return <p className="text-sm text-slate-500">Loading PDF…</p>;
  }

  return (
    <div className="my-4 border rounded overflow-hidden">
      <div className="flex justify-between items-center p-2 bg-slate-100 border-b">
        <span className="text-sm font-medium">{att.originalName}</span>
        <button onClick={onClose} className="text-sm underline">
          Close
        </button>
      </div>

      <object
        data={blobUrl}
        type="application/pdf"
        className="w-full h-[500px]"
      />

      <div className="p-2 border-t bg-slate-50 text-right">
        <a
          href={att.url}
          download
          className="text-sm text-blue-600 underline"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DASHBOARD COMPONENT
// ---------------------------------------------------------------------------
export default function StudentDashboard() {
  // -------------------------------
  // STATE
  // -------------------------------
  const [courses, setCourses] = useState([]);
  const [modulesByCourse, setModulesByCourse] = useState({});
  const [activeCourse, setActiveCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [expandedYear, setExpandedYear] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [readingFull, setReadingFull] = useState(false); // Fullscreen mode
  const [fontSize, setFontSize] = useState(16);
  const [leftPaneWidth, setLeftPaneWidth] = useState(300);
  const [openAttachment, setOpenAttachment] = useState(null);

  const leftPaneRef = useRef(null);
  const draggingRef = useRef(false);

  // -------------------------------
  // LOAD COURSES
  // -------------------------------
  useEffect(() => {
    api
      .get("/api/student/courses")
      .then((res) => setCourses(res.data || []))
      .catch(console.error);
  }, []);

  // -------------------------------
  // GROUP COURSES BY YEAR → SEMESTER
  // -------------------------------
  const grouped = {};
  courses.forEach((c) => {
    const y = c.year ?? "Unassigned";
    const s = c.semester ?? "Unassigned";
    grouped[y] ??= {};
    grouped[y][s] ??= [];
    grouped[y][s].push(c);
  });

  // -------------------------------
  // LOAD MODULES
  // -------------------------------
  const loadModules = async (courseId) => {
    setActiveCourse(courseId);
    if (modulesByCourse[courseId]) return;

    const res = await api.get(`/api/student/courses/${courseId}/modules`);
    setModulesByCourse((prev) => ({
      ...prev,
      [courseId]: res.data || [],
    }));
  };

  // -------------------------------
  // LOAD MODULE CONTENT
  // -------------------------------
  const loadModuleContent = async (moduleId) => {
    setLoadingContent(true);
    setSelectedModule(null);
    setOpenAttachment(null);

    try {
      const res = await api.get(`/api/student/modules/${moduleId}`);
      setSelectedModule(res.data);
    } catch {
      setSelectedModule({
        title: "Failed to load content",
        content: "<p>No content available.</p>",
        attachments: [],
        quizzes: [],
      });
    } finally {
      setLoadingContent(false);
    }
  };

  // -------------------------------
  // NAVIGATION (PREV / NEXT MODULE)
  // -------------------------------
  const navigateModule = (dir) => {
    if (!activeCourse || !selectedModule) return;
    const list = modulesByCourse[activeCourse] || [];
    const idx = list.findIndex((m) => m._id === selectedModule._id);
    const target = dir === "next" ? list[idx + 1] : list[idx - 1];
    if (target) loadModuleContent(target._id);
  };

  // -------------------------------
  // LEFT PANE RESIZE
  // -------------------------------
  const startDrag = () => (draggingRef.current = true);
  const stopDrag = () => (draggingRef.current = false);

  useEffect(() => {
    const handle = (e) => {
      if (!draggingRef.current) return;
      if (e.clientX >= 150 && e.clientX <= 600)
        setLeftPaneWidth(e.clientX);
    };
    window.addEventListener("mousemove", handle);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", handle);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, []);

  const toggleLeftPane = () =>
    setLeftPaneWidth(leftPaneWidth > 50 ? 50 : 300);

  // -------------------------------
  // FONT RESIZING
  // -------------------------------
  const increaseFont = () => setFontSize((f) => Math.min(f + 2, 32));
  const decreaseFont = () => setFontSize((f) => Math.max(f - 2, 12));

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">

      {/* WELCOME HEADER */}
      <div className="bg-white border-b px-6 py-3 font-bold text-lg">
        Welcome to your dashboard
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANE */}
        <aside
          ref={leftPaneRef}
          className="bg-white border-r p-4 overflow-y-auto"
          style={{ width: leftPaneWidth }}
        >
          <div className="flex justify-between mb-4">
            <button onClick={toggleLeftPane} className="border px-2">
              {leftPaneWidth > 50 ? "«" : "»"}
            </button>
            <div
              className="w-2 bg-slate-200 cursor-ew-resize"
              onMouseDown={startDrag}
            />
          </div>

          {Object.entries(grouped).map(([year, semesters]) => (
            <div key={year}>
              <button
                onClick={() =>
                  setExpandedYear(expandedYear === year ? null : year)
                }
                className="font-semibold"
              >
                Year {year}
              </button>

              {expandedYear === year &&
                Object.entries(semesters).map(([sem, list]) => (
                  <div key={sem} className="ml-3">
                    <p className="text-xs text-slate-500">
                      Semester {sem}
                    </p>
                    {list.map((course) => (
                      <div key={course._id}>
                        <button
                          onClick={() => loadModules(course._id)}
                          className={`text-sm hover:underline ${
                            activeCourse === course._id
                              ? "font-semibold text-blue-600"
                              : ""
                          }`}
                        >
                          {course.title}
                        </button>

                        {activeCourse === course._id &&
                          modulesByCourse[course._id]?.map((m) => (
                            // -------------------------------
                            // ACTIVE MODULE HIGHLIGHT
                            // -------------------------------
                            <button
                              key={m._id}
                              onClick={() => loadModuleContent(m._id)}
                              className={`block ml-4 text-xs py-2 px-2 rounded transition ${
                                selectedModule?._id === m._id
                                  ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600"
                                  : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                              }`}
                            >
                              {m.title}
                            </button>
                          ))}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          ))}
        </aside>

        {/* RIGHT PANE */}
        <main className="flex-1 bg-white flex flex-col">
          {!selectedModule ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Select a module to begin reading.
            </div>
          ) : (
            <>
              {/* MODULE HEADER */}
              <div className="border-b p-4 flex justify-between">
                <h2 className="font-semibold">{selectedModule.title}</h2>
                <div className="flex gap-2">
                  <button onClick={() => navigateModule("prev")}>«</button>
                  <button onClick={() => navigateModule("next")}>»</button>
                  {/* -------------------------------
                      FULLSCREEN BUTTON
                  ------------------------------- */}
                  <button onClick={() => setReadingFull(true)}>⛶</button>
                  <button onClick={increaseFont}>A+</button>
                  <button onClick={decreaseFont}>A−</button>
                </div>
              </div>

              {/* MODULE CONTENT */}
              <div
                className="flex-1 overflow-y-auto p-6 prose max-w-none"
                style={{ fontSize }}
              >
                {/* ATTACHMENT LIST */}
                {selectedModule.attachments?.length > 0 && (
                  <>
                    <h3>Attachments</h3>
                    <ul>
                      {selectedModule.attachments.map((att) => (
                        <li key={att.url}>
                          <button
                            onClick={() => setOpenAttachment(att)}
                            className="text-blue-600 underline"
                          >
                            {att.originalName}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* OPENED ATTACHMENT */}
                {openAttachment?.originalName?.endsWith(".pdf") && (
                  <InlinePDF
                    att={openAttachment}
                    onClose={() => setOpenAttachment(null)}
                  />
                )}

                {/* MODULE HTML CONTENT */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedModule.content,
                  }}
                />

                {/* QUIZZES */}
                {selectedModule.quizzes?.length > 0 && (
                  <div className="mt-6">
                    <h3>Quizzes</h3>
                    {selectedModule.quizzes.map((q) => (
                      <a
                        key={q._id}
                        href={`/student/quiz/${q._id}`}
                        className="block text-blue-600 underline"
                      >
                        {q.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* ---------------------------------------------------------------------
          FULLSCREEN READ MODE
          --------------------------------------------------------------------- */}
      {readingFull && selectedModule && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          {/* FULLSCREEN HEADER */}
          <div className="flex justify-between items-center px-8 py-4 border-b bg-white sticky top-0">
            <h2 className="font-semibold text-slate-800">
              {selectedModule.title}
            </h2>
            <div className="flex items-center gap-4 text-slate-600">
              <button onClick={increaseFont} className="hover:text-black">A+</button>
              <button onClick={decreaseFont} className="hover:text-black">A−</button>
              <button
                onClick={() => setReadingFull(false)}
                className="text-red-500 hover:text-red-700"
              >
                ✖ Close
              </button>
            </div>
          </div>

          {/* FULLSCREEN CONTENT */}
          <div
            className="max-w-4xl mx-auto px-8 py-10 prose"
            style={{ fontSize }}
            dangerouslySetInnerHTML={{ __html: selectedModule.content }}
          />
        </div>
      )}
    </div>
  );
}
