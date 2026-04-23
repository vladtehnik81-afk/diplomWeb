import { useEffect, useRef } from "react";

/**
 * Добавляет класс "visible" когда элемент появляется в viewport
 * Использование:
 *   const ref = useScrollReveal()
 *   <div ref={ref} className="reveal">...</div>
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: options.threshold || 0.12, rootMargin: options.rootMargin || "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/**
 * Для группы дочерних элементов — каждый появляется с задержкой
 * Использование:
 *   const ref = useScrollRevealGroup()
 *   <div ref={ref}>
 *     <div className="reveal">...</div>
 *     <div className="reveal">...</div>
 *   </div>
 */
export function useScrollRevealGroup(selector = ".reveal, .reveal-left, .reveal-scale") {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const items = container.querySelectorAll(selector);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, i * 60);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return ref;
}