import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Dropdown from "../components/Dropdown.jsx";
import { UniversityRowSkeleton } from "../components/Skeleton.jsx";
import FavoriteButton from "../components/FavoriteButton.jsx";

const TAG_STYLES = {
  blue:   "bg-blue-50 text-blue-700",
  green:  "bg-green-50 text-green-700",
  amber:  "bg-amber-50 text-amber-700",
  teal:   "bg-teal-50 text-teal-700",
  purple: "bg-purple-50 text-purple-700",
};

const SORT_OPTIONS = [
  { value: "rating",  label: "По рейтингу" },
  { value: "score",   label: "По баллу (убыв.)" },
  { value: "places",  label: "По числу мест" },
  { value: "name",    label: "По алфавиту" },
];

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState([]);
  const [cities,       setCities]       = useState([]);
  const [directions,   setDirections]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const [search,    setSearch]    = useState("");
  const [city,      setCity]      = useState("");
  const [direction, setDirection] = useState("");
  const [sortBy,    setSortBy]    = useState("rating");

  // Загружаем фильтры
  useEffect(() => {
    api.getCities().then(setCities).catch(() => {});
    api.getDirections().then(setDirections).catch(() => {});
  }, []);

  // Загружаем вузы при изменении фильтров
  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getUniversities({ city, direction, search, sortBy })
      .then((data) => { setUniversities(data); setLoading(false); })
      .catch((err)  => { setError(err.message); setLoading(false); });
  }, [city, direction, sortBy]);

  // Поиск по названию — локально (без лишних запросов)
  const filtered = search
    ? universities.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.short_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.city || "").toLowerCase().includes(search.toLowerCase())
      )
    : universities;

  function reset() {
    setSearch(""); setCity(""); setDirection(""); setSortBy("rating");
  }

  const hasFilters = search || city || direction;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Вузы России</h1>
        <p className="text-sm text-slate-400">
          {loading ? "Загружаем..." : `${universities.length} университетов · данные за 2024 год`}
        </p>
      </div>

      {/* Поиск и фильтры */}
      <div className="card p-4 mb-6">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Поиск по названию, аббревиатуре или городу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base"
          />
        </div>
        <div className="flex flex-wrap gap-3 items-end relative">
          <Dropdown
            label="Город"
            value={city}
            onChange={setCity}
            placeholder="Все города"
            options={cities}
          />
          <Dropdown
            label="Направление"
            value={direction}
            onChange={setDirection}
            placeholder="Все направления"
            options={directions}
          />
          <Dropdown
            label="Сортировка"
            value={sortBy}
            onChange={setSortBy}
            placeholder="По рейтингу"
            options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          {hasFilters && (
            <button onClick={reset} className="btn-ghost self-end">Сбросить</button>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-4">
        Найдено: <span className="font-medium text-slate-700">
          {loading ? "..." : filtered.length}
        </span>
      </p>

      {/* Ошибка */}
      {error && (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm mb-2">Ошибка: {error}</p>
          <p className="text-xs text-slate-400">Убедись что бэкенд запущен на порту 8000</p>
        </div>
      )}

      {/* Загрузка */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <UniversityRowSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Список */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg mb-2">Ничего не найдено</p>
          <button onClick={reset} className="btn-ghost mt-4">Сбросить</button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in opacity-0"
             style={{ animationFillMode: "forwards" }}>
          {filtered.map((u, i) => (
            <UniCard key={u.id} university={u} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function UniCard({ university, index }) {
  const {
    id, name, short_name, city,
    min_score, avg_score, budget_places,
    tag, tag_color, direction, website,
  } = university;

  return (
    <div
      className={`card p-5 flex flex-col gap-3 hover:shadow-md transition-all duration-200
                  animate-fade-up opacity-0 stagger-${Math.min(index + 1, 8)}`}
      style={{ animationFillMode: "forwards" }}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className={`tag ${TAG_STYLES[tag_color] || TAG_STYLES.teal}`}>{tag || "Вуз"}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-300 font-medium">{short_name}</span>
            <FavoriteButton universityId={id} />
          </div>
        </div>
        <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-1">{name}</h3>
        <p className="text-xs text-slate-400">{city} · {direction}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Мин. балл", value: min_score || "—" },
          { label: "Средний",   value: avg_score || "—" },
          { label: "Мест",      value: budget_places ? budget_places.toLocaleString("ru-RU") : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-50 rounded-xl p-2 text-center">
            <p className="text-xs text-slate-400 mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-slate-800 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-auto pt-1 border-t border-slate-50">
        <Link
          to={`/university/${id}`}
          className="flex-1 text-center py-2 text-xs font-medium text-brand-600
                     hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
        >
          Подробнее
        </Link>
        {website && (
          <a
            href={website} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center py-2 text-xs font-medium text-slate-500
                       hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors
                       border border-slate-100"
          >
            Офиц. сайт ↗
          </a>
        )}
      </div>
    </div>
  );
}