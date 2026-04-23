import { useState, useEffect } from "react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!visible) return null;

  return (
    <button
      onClick={scrollTop}
      aria-label="Наверх"
      className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-brand-600
                 hover:bg-brand-700 active:scale-95 text-white shadow-lg
                 flex items-center justify-center transition-all duration-200
                 animate-fade-in opacity-0"
      style={{ animationFillMode: "forwards" }}
    >
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <path d="M8 12L8 4M4 8L8 4L12 8"
          stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}