import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/",             label: "Главная" },
  { to: "/universities", label: "Вузы" },
  { to: "/specialties",  label: "Специальности" },
  { to: "/compare",      label: "Сравнить" },
];

export default function Navbar() {
  const { pathname }    = useLocation();
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 13L8 4M4 8L8 4L12 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span
            className="text-base font-bold tracking-tight text-slate-900"
            style={{ fontFamily: "Unbounded, sans-serif" }}
          >
            куда<span className="text-brand-600">поступать</span>
          </span>
        </Link>

        {/* Десктоп */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 ${
                pathname === to
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Профиль / Войти */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                           text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center
                                text-xs font-bold text-brand-700">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Выйти
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-ghost text-sm">
              Войти
            </Link>
          )}
        </div>

        {/* Бургер */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5
                     rounded-lg hover:bg-slate-50 transition-colors"
          aria-label="Меню"
        >
          <span className={`block w-5 h-0.5 bg-slate-600 transition-all duration-200 origin-center ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-5 h-0.5 bg-slate-600 transition-all duration-200 ${open ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-slate-600 transition-all duration-200 origin-center ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Мобильное меню */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === to ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-slate-100 mt-2 pt-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Профиль — {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50"
                >
                  Выйти
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-brand-600 hover:bg-brand-50"
              >
                Войти / Регистрация
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}