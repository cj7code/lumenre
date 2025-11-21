// TutorDashboard.jsx
// ----------------------------------------------------------
// Tutor has the same functionality as Admin EXCEPT
// they cannot manage users.
// They CAN:
//   • Upload AI drafts
//   • Upload files to modules
//   • View drafts they generated
// ----------------------------------------------------------
import AdminDashboard from "./AdminDashboard";

export default function TutorDashboard() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Tutor Dashboard</h1>
      <AdminDashboard /> {/* Reuse admin features */}
    </div>
  );
}
