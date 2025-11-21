// src/pages/TutorDashboard.jsx
// -------------------------------------------------------------
// Tutor Dashboard
// Tutors can:
//   • Upload AI drafts
//   • Upload files to modules
//   • View drafts they generated
// -------------------------------------------------------------

import TutorDrafts from "./TutorDrafts";
import TutorUploads from "./TutorUploads";

export default function TutorDashboard() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold">Tutor Dashboard</h1>

      {/* AI Drafts */}
      <TutorDrafts />

      {/* Module Uploads */}
      <TutorUploads />
    </div>
  );
}
