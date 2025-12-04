import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, User } from "lucide-react";

export default function BottomNav() {
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user || user.role !== "student") return null;

  const active = (path) =>
    pathname.startsWith(path) ? "text-teal-600" : "text-slate-500";

  return (
    <nav className="
      fixed bottom-0 left-0 w-full bg-white 
      border-t border-slate-200 h-14 
      flex justify-around items-center 
      md:hidden z-50
    ">
      <Link to="/student" className="flex flex-col items-center text-xs">
        <Home size={20} className={active("/student")} />
        <span className={active("/student")}>Home</span>
      </Link>

      <Link to="/courses" className="flex flex-col items-center text-xs">
        <BookOpen size={20} className={active("/courses")} />
        <span className={active("/courses")}>Courses</span>
      </Link>

      <Link to="/profile" className="flex flex-col items-center text-xs">
        <User size={20} className={active("/profile")} />
        <span className={active("/profile")}>Profile</span>
      </Link>
    </nav>
  );
}
