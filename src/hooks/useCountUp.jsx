import { useState, useEffect, useRef } from "react";

/**
 * Анимирует число от 0 до target
 * @param {number} target — конечное значение
 * @param {number} duration — длительность в мс (по умолчанию 1200)
 * @param {number} delay — задержка перед стартом в мс
 */
export function useCountUp(target, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!target || target === 0) return;

    let timeoutId = setTimeout(() => {
      const startTime = performance.now();
      const startVal  = 0;
      const endVal    = typeof target === "number" ? target : parseFloat(target) || 0;

      function tick(now) {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setValue(Math.round(startVal + (endVal - startVal) * eased));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return value;
}

/**
 * Компонент — анимированное число
 * Автоматически запускает анимацию когда элемент попадает в viewport
 */
export function AnimatedNumber({ value, duration = 1200, delay = 0, className = "", suffix = "", prefix = "" }) {
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const count = useCountUp(started ? (typeof value === "number" ? value : parseFloat(value) || 0) : 0, duration, 0);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    const timeout = setTimeout(() => observer.observe(ref.current), delay);
    return () => { clearTimeout(timeout); observer.disconnect(); };
  }, [delay]);

  // Форматируем с разделителем тысяч
  const formatted = count.toLocaleString("ru-RU");

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
