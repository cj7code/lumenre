// src/components/Layout.jsx
import Footer from "./Footer";
import BackToTop from "./BackToTop";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
      <main className="flex-grow">{children}</main>
      <BackToTop />
    </div>
  );
}
