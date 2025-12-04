// src/components/ModuleAttachmentsViewer.jsx
// ---------------------------------------------------------------------
// Student-facing component to show module attachments inline
// Usage:
//   <ModuleAttachmentsViewer module={module} />
// Where module.attachments is the array from backend
// ---------------------------------------------------------------------

export default function ModuleAttachmentsViewer({ module }) {
  const attachments = module?.attachments || [];

  if (!attachments.length) {
    return (
      <p className="text-sm text-gray-500">
        Notes not uploaded yet. Please check again later.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-lg font-semibold">Module Notes & Resources</h3>

      {attachments.map((file) => {
        const isImage = file.type?.startsWith("image/");
        const isPDF = file.type === "application/pdf";

        return (
          <div
            key={file.public_id}
            className="p-3 border rounded bg-white shadow-sm"
          >
            <div className="flex items-start gap-3">
              {/* Small thumb */}
              {isImage && (
                <img
                  src={file.url}
                  alt={file.originalName || ""}
                  className="w-16 h-16 object-cover rounded border"
                />
              )}

              {isPDF && (
                <iframe
                  src={file.url}
                  className="w-24 h-24 border rounded"
                  title={`Preview ${file.originalName || ""}`}
                ></iframe>
              )}

              {!isImage && !isPDF && (
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded text-xs text-gray-600">
                  📄 {file.type?.split("/")[1] || "file"}
                </div>
              )}

              <div className="flex-1">
                <div className="font-medium text-sm">
                  {file.originalName || "Resource"}
                </div>
                <p className="text-xs text-gray-500">{file.type}</p>

                <button
                  onClick={() =>
                    window.open(file.url, "_blank", "noopener,noreferrer")
                  }
                  className="mt-1 text-primary text-xs underline"
                >
                  Open in new tab
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// On student course/module page, after rendering each module, do:

// <ModuleAttachmentsViewer module={module} />