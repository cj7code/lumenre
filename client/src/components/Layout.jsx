import BackToTop from "./BackToTop";
import BottomNav from "./BottomNav";

export default function Layout({ children }) {
  return (
    <div className="flex-1 w-full pb-16 md:pb-0">
      
      {/* Global page wrapper */}
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6 w-full">
        {children}
      </div>

      <BackToTop />

      {/* Mobile navigation for students */}
      <BottomNav />
    </div>
  );
}
