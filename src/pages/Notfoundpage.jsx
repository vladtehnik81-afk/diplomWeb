import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center animate-fade-up opacity-0" style={{ animationFillMode: "forwards" }}>

        {/* Большой номер */}
        <div className="relative mb-6">
          <p
            className="text-[120px] sm:text-[160px] font-bold leading-none select-none"
            style={{
              fontFamily: "Unbounded, sans-serif",
              color: "transparent",
              WebkitTextStroke: "2px #e2e8f0",
            }}
          >
            404
          </p>
          {/* Иконка поверх */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 19L12 6M6 12L12 6L18 12"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Страница не найдена
        </h1>
        <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">
          Такой страницы не существует. Возможно, ссылка устарела или была удалена.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">
            На главную
          </Link>
          <Link to="/universities" className="btn-ghost">
            Все вузы
          </Link>
        </div>
      </div>
    </div>
  );
}