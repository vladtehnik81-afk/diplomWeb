import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";

const TAG_STYLES = {
  blue:   "bg-blue-50 text-blue-700",
  green:  "bg-green-50 text-green-700",
  amber:  "bg-amber-50 text-amber-700",
  teal:   "bg-teal-50 text-teal-700",
  purple: "bg-purple-50 text-purple-700",
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.getFavorites()
      .then(setFavorites)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  async function removeFav(id) {
    await api.removeFavorite(id);
    setFavorites((prev) => prev.filter((u) => u.id !== id));
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* Шапка профиля */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center
                            text-xl font-bold text-brand-600 flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{user.name}</h1>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost text-sm text-red-500 border-red-100 hover:bg-red-50"
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {[
          { label: "Избранных вузов", value: favorites.length, color: "text-brand-600" },
          { label: "Сравнений",       value: "—",              color: "text-slate-900" },
          { label: "Поисков",         value: "—",              color: "text-slate-900" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-semibold tabular-nums ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Избранные вузы */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Избранные вузы
            {favorites.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-400">{favorites.length}</span>
            )}
          </h2>
          <Link to="/universities" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
            Найти вузы →
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400 text-center py-12">Загружаем...</p>
        ) : favorites.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-3xl mb-3">🏛️</p>
            <p className="text-slate-600 font-medium mb-1">Нет избранных вузов</p>
            <p className="text-sm text-slate-400 mb-4">
              Добавляй вузы в избранное чтобы быстро к ним возвращаться
            </p>
            <Link to="/" className="btn-primary inline-block">
              Найти вузы
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map((u) => (
              <div key={u.id} className="card p-4 flex flex-col gap-3">
                {/* Фото */}
                {u.photo_url && (
                  <div className="h-28 rounded-xl overflow-hidden relative">
                    <img
                      src={u.photo_url}
                      alt={u.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }}
                    />
                  </div>
                )}

                <div>
                  <span className={`tag text-xs ${TAG_STYLES[u.tag_color] || TAG_STYLES.teal} mb-1`}>
                    {u.tag || "Вуз"}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">{u.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{u.city} · {u.direction}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-50 rounded-xl p-2 text-center">
                    <p className="text-xs text-green-600">Бюджет от</p>
                    <p className="text-sm font-semibold text-green-800">{u.min_score || "—"}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-2 text-center">
                    <p className="text-xs text-amber-600">Стоимость</p>
                    <p className="text-xs font-semibold text-amber-800">
                      {u.tuition_fee ? (u.tuition_fee / 1000).toFixed(0) + "к ₽" : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto pt-1 border-t border-slate-50">
                  <Link
                    to={`/university/${u.id}`}
                    className="flex-1 text-center py-2 text-xs font-medium text-brand-600
                               hover:bg-brand-50 rounded-lg transition-colors"
                  >
                    Подробнее →
                  </Link>
                  <button
                    onClick={() => removeFav(u.id)}
                    className="px-3 py-2 text-xs text-red-400 hover:text-red-600
                               hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Убрать
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}