import { useState, useEffect } from "react";
import { api } from "../api";
import UniversityCard from "./UniversityCard";
import Dropdown from "./Dropdown.jsx";
import { UniversitiesGridSkeleton } from "./Skeleton.jsx";

const SORT_OPTIONS = [
  { value: "match",  label: "По совпадению" },
  { value: "score",  label: "По баллу (убыв.)" },
  { value: "places", label: "По числу мест" },
  { value: "rating", label: "По рейтингу" },
  { value: "price",  label: "По цене (возр.)" },
];

const STATUS_OPTIONS = [
  { value: "all",        label: "Все" },
  { value: "passing",    label: "Проходишь" },
  { value: "borderline", label: "На границе" },
  { value: "lacking",    label: "Не хватает" },
];

export default function ResultsSection({ total, formType = "all" }) {
  const [city,      setCity]      = useState("");
  const [direction, setDirection] = useState("");
  const [sortBy,    setSortBy]    = useState("match");
  const [status,    setStatus]    = useState("all");

  const [universities, setUniversities] = useState([]);
  const [cities,       setCities]       = useState([]);
  const [directions,   setDirections]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  // Загружаем фильтры один раз
  useEffect(() => {
    api.getCities().then(setCities).catch(() => {});
    api.getDirections().then(setDirections).catch(() => {});
  }, []);

  // Загружаем вузы при изменении параметров
  useEffect(() => {
    setLoading(true);
    setError(null);
    api.search({ total, formType, city, direction, sortBy })
      .then((data) => { setUniversities(data); setLoading(false); })
      .catch((err)  => { setError(err.message); setLoading(false); });
  }, [total, formType, city, direction, sortBy]);

  // Фильтр по статусу — на фронте
  const filtered = universities.filter((u) => {
    if (status === "passing")    return total >= (u.avg_score  || 0);
    if (status === "borderline") return total >= (u.min_score  || 0) && total < (u.avg_score  || 0);
    if (status === "lacking")    return total <  (u.min_score  || 0);
    return true;
  });

  const passing    = universities.filter((u) => total >= (u.avg_score  || 0)).length;
  const borderline = universities.filter((u) => total >= (u.min_score  || 0) && total < (u.avg_score  || 0)).length;
  const canPay     = universities.filter((u) => total >= (u.min_score_paid || 0) && total < (u.min_score || 0)).length;

  function reset() {
    setCity(""); setDirection(""); setSortBy("match"); setStatus("all");
  }

  const hasFilters = city || direction || status !== "all";
  const formLabel  = formType === "budget" ? "Бюджет" : formType === "paid" ? "Платное" : null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 animate-fade-in opacity-0"
             style={{ animationFillMode: "forwards" }}>

      {formLabel && (
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6
          ${formType === "budget" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
          {formType === "budget" ? "Показываем вузы на бюджет" : "Показываем вузы на платное"}
        </div>
      )}

      {/* Статистика */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Сумма баллов",   value: total,      color: "text-slate-900" },
          { label: "На бюджет",      value: passing,    color: "text-green-600" },
          { label: "На границе",     value: borderline, color: "text-amber-600" },
          { label: "Только платное", value: canPay,     color: "text-orange-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className={`text-2xl font-semibold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Фильтры */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-6 relative">
        <div className="flex flex-wrap gap-3 items-end">
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
            label="Статус"
            value={status}
            onChange={setStatus}
            placeholder="Все"
            options={STATUS_OPTIONS.slice(1).map((o) => ({ value: o.value, label: o.label }))}
          />
          <Dropdown
            label="Сортировка"
            value={sortBy}
            onChange={setSortBy}
            placeholder="По совпадению"
            options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          {hasFilters && (
            <button onClick={reset} className="btn-ghost self-end whitespace-nowrap">Сбросить</button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900">
          Найдено вузов
          <span className="ml-2 text-sm font-normal text-slate-400">
            {loading ? "..." : filtered.length}
          </span>
        </h2>
      </div>

      {/* Состояния */}
      {loading && <UniversitiesGridSkeleton count={8} />}

      {error && (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm mb-2">Ошибка загрузки: {error}</p>
          <p className="text-xs text-slate-400">Убедись что бэкенд запущен на порту 8000</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg mb-2">Ничего не найдено</p>
          <button onClick={reset} className="btn-ghost mt-4">Сбросить фильтры</button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in opacity-0"
             style={{ animationFillMode: "forwards" }}>
          {filtered.map((university, i) => (
            <UniversityCard
              key={university.id}
              university={university}
              total={total}
              formType={formType}
              index={i}
            />
          ))}
        </div>
      )}
    </section>
  );
}