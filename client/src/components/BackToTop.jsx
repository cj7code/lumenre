import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 bg-teal-600 hover:bg-teal-700 
      p-3 rounded-full shadow-lg text-white"
    >
      <ArrowUp size={18} />
    </button>
  );
}
