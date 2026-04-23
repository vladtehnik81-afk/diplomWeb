import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const TAG_STYLES = {
  blue:   "bg-blue-50 text-blue-700",
  green:  "bg-green-50 text-green-700",
  amber:  "bg-amber-50 text-amber-700",
  teal:   "bg-teal-50 text-teal-700",
  purple: "bg-purple-50 text-purple-700",
};

const MAX = 3;

export default function ComparePage() {
  const [all,      setAll]      = useState([]);
  const [selected, setSelected] = useState([]);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.getUniversities({ sortBy: "rating" })
      .then((data) => { setAll(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function addUniversity(uni) {
    if (selected.length >= MAX) return;
    if (selected.find((u) => u.id === uni.id)) return;
    setSelected((prev) => [...prev, uni]);
    setSearch("");
  }

  function removeUniversity(id) {
    setSelected((prev) => prev.filter((u) => u.id !== id));
  }

  const suggestions = search.length > 1
    ? all
        .filter((u) =>
          !selected.find((s) => s.id === u.id) &&
          (u.name.toLowerCase().includes(search.toLowerCase()) ||
           (u.short_name || "").toLowerCase().includes(search.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  // Строки для сравнения
  const rows = [
    { label: "Город",            key: (u) => u.city || "—" },
    { label: "Направление",      key: (u) => u.direction || "—" },
    { label: "Мин. балл (бюджет)", key: (u) => u.min_score || "—", highlight: true, best: "max" },
    { label: "Средний балл",     key: (u) => u.avg_score || "—", highlight: true, best: "max" },
    { label: "Мин. балл (платное)", key: (u) => u.min_score_paid || "—", highlight: true, best: "min" },
    { label: "Стоимость в год",  key: (u) => u.tuition_fee ? u.tuition_fee.toLocaleString("ru-RU") + " ₽" : "—", highlight: true, best: "min", numKey: (u) => u.tuition_fee },
    { label: "Бюджетных мест",   key: (u) => u.budget_places ? u.budget_places.toLocaleString("ru-RU") : "—", highlight: true, best: "max", numKey: (u) => u.budget_places },
    { label: "Рейтинг",          key: (u) => u.rating ? `#${u.rating}` : "—", highlight: true, best: "min", numKey: (u) => u.rating },
    { label: "Официальный сайт", key: (u) => u.website || null, isLink: true },
  ];

  function getBestId(row) {
    if (!row.highlight || selected.length < 2) return null;
    const getVal = row.numKey ||
      (row.best === "max"
        ? (u) => typeof row.key(u) === "number" ? row.key(u) : parseInt(row.key(u)) || 0
        : (u) => typeof row.key(u) === "number" ? row.key(u) : parseInt(row.key(u)) || 999999);

    const vals = selected.map((u) => ({ id: u.id, val: getVal(u) })).filter((x) => x.val);
    if (!vals.length) return null;
    const best = row.best === "max"
      ? vals.reduce((a, b) => a.val > b.val ? a : b)
      : vals.reduce((a, b) => a.val < b.val ? a : b);
    return best.id;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Сравнение вузов</h1>
        <p className="text-sm text-slate-400">Добавь до {MAX} вузов чтобы сравнить их параметры</p>
      </div>

      {/* Поиск и добавление */}
      <div className="card p-4 mb-8 relative">
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          {/* Выбранные вузы */}
          <div className="flex flex-wrap gap-2 flex-1">
            {selected.map((u) => (
              <div key={u.id}
                className="flex items-center gap-2 bg-brand-50 text-brand-700 text-sm
                           px-3 py-1.5 rounded-xl border border-brand-200">
                <span className="font-medium">{u.short_name || u.name.split(" ")[0]}</span>
                <button
                  onClick={() => removeUniversity(u.id)}
                  className="text-brand-400 hover:text-brand-700 font-bold text-base leading-none"
                >×</button>
              </div>
            ))}
            {selected.length < MAX && (
              <span className="text-xs text-slate-400 self-center">
                {selected.length === 0 ? "Начни вводить название вуза →" : `Можно добавить ещё ${MAX - selected.length}`}
              </span>
            )}
          </div>

          {/* Поиск */}
          {selected.length < MAX && (
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Поиск вуза..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base"
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200
                                rounded-xl shadow-lg z-20 overflow-hidden">
                  {suggestions.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => addUniversity(u)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.city}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Пустое состояние */}
      {selected.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-4xl mb-4">⚖️</p>
          <p className="text-lg font-medium text-slate-600 mb-2">Добавь вузы для сравнения</p>
          <p className="text-sm">Введи название вуза в поле поиска выше</p>
        </div>
      )}

      {/* Таблица сравнения */}
      {selected.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-slate-400 pb-4 pr-4 w-40">
                  Параметр
                </th>
                {selected.map((u) => (
                  <th key={u.id} className="pb-4 px-3 min-w-[200px]">
                    <div className="card p-4 text-left">
                      <span className={`tag text-xs ${TAG_STYLES[u.tag_color] || TAG_STYLES.teal} mb-2`}>
                        {u.tag || "Вуз"}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 leading-snug mb-1">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.city}</p>
                      <div className="flex gap-2 mt-3">
                        <Link
                          to={`/university/${u.id}`}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                        >
                          Подробнее →
                        </Link>
                        <button
                          onClick={() => removeUniversity(u.id)}
                          className="text-xs text-slate-400 hover:text-red-500 ml-auto"
                        >
                          Убрать
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
                {/* Пустые слоты */}
                {Array.from({ length: MAX - selected.length }).map((_, i) => (
                  <th key={`empty-${i}`} className="pb-4 px-3 min-w-[200px]">
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center h-full min-h-[120px] flex items-center justify-center">
                      <p className="text-xs text-slate-400">+ Добавить вуз</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                const bestId = getBestId(row);
                return (
                  <tr key={ri} className={ri % 2 === 0 ? "bg-slate-50/50" : ""}>
                    <td className="py-3 pr-4 text-xs text-slate-500 font-medium align-middle">
                      {row.label}
                    </td>
                    {selected.map((u) => {
                      const val     = row.key(u);
                      const isBest  = row.highlight && bestId === u.id;
                      return (
                        <td key={u.id} className="py-3 px-3 align-middle">
                          <div className={`text-sm rounded-xl px-3 py-2 text-center transition-colors
                            ${isBest
                              ? "bg-green-50 text-green-700 font-semibold"
                              : "text-slate-700"}`}>
                            {row.isLink && val
                              ? <a href={val} target="_blank" rel="noopener noreferrer"
                                   className="text-brand-600 hover:underline text-xs">
                                  Открыть ↗
                                </a>
                              : val || "—"
                            }
                            {isBest && (
                              <span className="ml-1.5 text-xs">✓</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    {Array.from({ length: MAX - selected.length }).map((_, i) => (
                      <td key={`empty-${i}`} className="py-3 px-3">
                        <div className="text-sm text-slate-200 text-center">—</div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}