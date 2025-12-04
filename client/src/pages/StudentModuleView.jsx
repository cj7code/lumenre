// StudentModuleView.jsx
// ---------------------------------------------------------------------
// Fully upgraded student module view:
//  ✓ Safe inline previews (no auto-download)
//  ✓ Modal-based attachment viewer
//  ✓ Next/Prev navigation
//  ✓ Supports PDF, images, video, docx, pptx
//  ✓ Clean styling and no breaking changes
// ---------------------------------------------------------------------

import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function StudentModuleView() {
  const { moduleId } = useParams();
  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    try {
      const res = await api.get(`/api/student/modules/${moduleId}`);
      setMod(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load module");
    }
    setLoading(false);
  };

  // Normalize attachments array
  const attachments = Array.isArray(mod?.attachments) ? mod.attachments : [];

  // Safe Cloudinary preview URL
  const makeSafeUrl = (url) =>
    url
      ?.replace("fl_attachment", "")
      .replace("attachment", "")
      .replace("attname=", "") + "#toolbar=0&navpanes=0&view=FitH";

  // Modal open
  const openPreview = (index) => {
    setSelectedIndex(index);
  };

  const closeModal = () => setSelectedIndex(null);

  const next = () => {
    setSelectedIndex((i) => (i + 1 < attachments.length ? i + 1 : 0));
  };

  const prev = () => {
    setSelectedIndex((i) => (i > 0 ? i - 1 : attachments.length - 1));
  };

  const current = useMemo(
    () => (selectedIndex !== null ? attachments[selectedIndex] : null),
    [selectedIndex, attachments]
  );

  const type = current?.type || "";

  if (loading) return <p className="p-6">Loading module…</p>;
  if (!mod) return <p className="p-6 text-red-600">Module not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* -------------------------- TITLE -------------------------- */}
      <header>
        <h1 className="text-3xl font-bold">{mod.title}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Course: {mod.course?.title || "Unknown"}
        </p>
      </header>

      {/* -------------------------- CONTENT -------------------------- */}
      <section className="bg-white p-6 rounded shadow space-y-3">
        <h2 className="text-xl font-semibold">Learning Content</h2>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: mod.content || "<p>No content yet.</p>",
          }}
        />
      </section>

      {/* -------------------------- ATTACHMENTS -------------------------- */}
      {attachments.length > 0 && (
        <section className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold">Attachments</h2>

          <ul className="space-y-3">
            {attachments.map((file, index) => (
              <li
                key={file.public_id}
                className="p-3 border rounded flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition"
              >
                <div>
                  <p className="font-medium">{file.originalName}</p>
                  <p className="text-xs text-slate-500">{file.type}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openPreview(index)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                  >
                    Preview
                  </button>

                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-teal-600 text-white rounded text-xs"
                  >
                    Open
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* -------------------------- QUIZZES -------------------------- */}
      {Array.isArray(mod.quizzes) && mod.quizzes.length > 0 && (
        <section className="bg-white p-6 rounded shadow space-y-3">
          <h2 className="text-xl font-semibold">Quizzes</h2>

          <ul className="space-y-2">
            {mod.quizzes.map((q) => (
              <li
                key={q._id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span>{q.title || "Quiz"}</span>
                <Link
                  to={`/student/quiz/${q._id}`}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                >
                  Start Quiz
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* -------------------------- BACK LINK -------------------------- */}
      <div className="pt-4">
        <Link to="/student" className="text-primary underline text-sm">
          ← Back to modules
        </Link>
      </div>

      {/* -------------------------- MODAL VIEWER -------------------------- */}
      {selectedIndex !== null && current && (
        <AttachmentViewerModal
          file={current}
          safeUrl={makeSafeUrl(current.url)}
          onClose={closeModal}
          onNext={next}
          onPrev={prev}
        />
      )}
    </div>
  );
}

/* ====================================================================== */
/*                        ATTACHMENT VIEWER MODAL                         */
/* ====================================================================== */

function AttachmentViewerModal({ file, safeUrl, onClose, onNext, onPrev }) {
  const type = file?.type || "";

  const isImage = type.startsWith("image/");
  const isVideo = type.startsWith("video/");
  const isPDF = type === "application/pdf";
  const isDoc =
    type.includes("word") ||
    type.includes("presentation") ||
    type.includes("officedocument");

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="relative bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center z-50"
        >
          ✕
        </button>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-100 p-4">
          {isImage && (
            <img
              src={safeUrl}
              alt={file.originalName}
              className="max-h-[80vh] mx-auto rounded shadow"
            />
          )}

          {isVideo && (
            <video
              src={safeUrl}
              controls
              className="max-h-[80vh] mx-auto rounded shadow"
            />
          )}

          {isPDF && (
            <iframe
              src={safeUrl}
              className="w-full h-[80vh] rounded border"
              title="PDF Preview"
            />
          )}

          {isDoc && (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                safeUrl
              )}`}
              className="w-full h-[80vh] rounded border"
              title="Document Preview"
            />
          )}

          {!isImage && !isVideo && !isPDF && !isDoc && (
            <p className="text-center text-slate-600 p-6">
              No preview available. Use “Open” to download.
            </p>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex justify-between items-center p-3 bg-slate-200">
          <button
            onClick={onPrev}
            className="px-4 py-1 bg-slate-700 text-white rounded"
          >
            ← Prev
          </button>
          <p className="text-sm font-medium">{file.originalName}</p>
          <button
            onClick={onNext}
            className="px-4 py-1 bg-slate-700 text-white rounded"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
