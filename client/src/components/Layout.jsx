import BackToTop from "./BackToTop";
import BottomNav from "./BottomNav";

export default function Layout({ children }) {
  return (
    <div className="flex-1 w-full pb-16 md:pb-0">

      {/* Global horizontal gutter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 w-full">

        {/* Page content */}
        <div className="py-4 md:py-6">
          {children}
        </div>

        {/* Footer / Mobile Nav stays aligned */}
        <BottomNav />
      </div>

      <BackToTop />
    </div>
  );
}
