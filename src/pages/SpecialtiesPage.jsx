import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const DIRECTION_INFO = {
  "IT и программирование": {
    icon: "💻",
    color: "bg-blue-50 text-blue-700 border-blue-100",
    desc: "Разработка ПО, искусственный интеллект, кибербезопасность, данные",
    subjects: ["Математика (профиль)", "Информатика и ИКТ", "Русский язык"],
  },
  "Экономика и управление": {
    icon: "📊",
    color: "bg-amber-50 text-amber-700 border-amber-100",
    desc: "Финансы, менеджмент, маркетинг, бухгалтерский учёт",
    subjects: ["Математика (профиль)", "Обществознание", "Русский язык"],
  },
  "Юриспруденция": {
    icon: "⚖️",
    color: "bg-purple-50 text-purple-700 border-purple-100",
    desc: "Гражданское, уголовное, международное право",
    subjects: ["Обществознание", "История", "Русский язык"],
  },
  "Медицина": {
    icon: "🩺",
    color: "bg-red-50 text-red-700 border-red-100",
    desc: "Лечебное дело, педиатрия, стоматология, фармация",
    subjects: ["Химия", "Биология", "Русский язык"],
  },
  "Инженерия": {
    icon: "⚙️",
    color: "bg-orange-50 text-orange-700 border-orange-100",
    desc: "Машиностроение, строительство, электроника, авиация",
    subjects: ["Математика (профиль)", "Физика", "Русский язык"],
  },
  "Естественные науки": {
    icon: "🔬",
    color: "bg-green-50 text-green-700 border-green-100",
    desc: "Физика, химия, биология, математика, география",
    subjects: ["Математика (профиль)", "Физика", "Химия"],
  },
  "Гуманитарные науки": {
    icon: "📚",
    color: "bg-teal-50 text-teal-700 border-teal-100",
    desc: "История, философия, филология, лингвистика, психология",
    subjects: ["История", "Обществознание", "Русский язык"],
  },
  "Педагогика": {
    icon: "🎓",
    color: "bg-indigo-50 text-indigo-700 border-indigo-100",
    desc: "Начальное образование, предметные специальности, дефектология",
    subjects: ["Обществознание", "Биология", "Русский язык"],
  },
  "Широкий профиль": {
    icon: "🌐",
    color: "bg-slate-50 text-slate-700 border-slate-100",
    desc: "Многопрофильные университеты с широким спектром направлений",
    subjects: ["Русский язык", "Математика (профиль)", "Обществознание"],
  },
};

export default function SpecialtiesPage() {
  const [directions,   setDirections]   = useState([]);
  const [unisByDir,    setUnisByDir]    = useState({});
  const [selected,     setSelected]     = useState(null);
  const [unis,         setUnis]         = useState([]);
  const [loadingUnis,  setLoadingUnis]  = useState(false);
  const [search,       setSearch]       = useState("");

  useEffect(() => {
    api.getDirections().then(setDirections).catch(() => {});
  }, []);

  // Загружаем вузы выбранного направления
  useEffect(() => {
    if (!selected) return;
    setLoadingUnis(true);
    api.getUniversities({ direction: selected, sortBy: "rating" })
      .then((data) => { setUnis(data); setLoadingUnis(false); })
      .catch(() => setLoadingUnis(false));
  }, [selected]);

  const filteredDirections = search
    ? directions.filter((d) => d.toLowerCase().includes(search.toLowerCase()))
    : directions;

  const info = (dir) => DIRECTION_INFO[dir] || {
    icon: "🏛️",
    color: "bg-slate-50 text-slate-700 border-slate-100",
    desc: "Различные специальности и программы обучения",
    subjects: ["Русский язык", "Математика"],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Направления подготовки</h1>
        <p className="text-sm text-slate-400">
          Выбери направление — покажем вузы и нужные предметы ЕГЭ
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Поиск направления..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filteredDirections.map((dir) => {
          const i = info(dir);
          return (
            <button
              key={dir}
              onClick={() => setSelected(selected === dir ? null : dir)}
              className={`card p-4 text-left transition-all duration-200 hover:shadow-md
                ${selected === dir ? "ring-2 ring-brand-400" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{i.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 mb-1">{dir}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{i.desc}</p>
                </div>
              </div>

              {/* Предметы ЕГЭ */}
              <div className="mt-3 flex flex-wrap gap-1">
                {i.subjects.map((s) => (
                  <span key={s}
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${i.color}`}>
                    {s.replace(" (профиль)", "").replace(" и ИКТ", "")}
                  </span>
                ))}
              </div>

              {selected === dir && (
                <p className="text-xs text-brand-600 font-medium mt-3">
                  Показать вузы ↓
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Вузы выбранного направления */}
      {selected && (
        <div className="animate-fade-in opacity-0" style={{ animationFillMode: "forwards" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Вузы — {selected}
              {!loadingUnis && (
                <span className="ml-2 text-sm font-normal text-slate-400">
                  {unis.length} университетов
                </span>
              )}
            </h2>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Свернуть ×
            </button>
          </div>

          {loadingUnis ? (
            <p className="text-sm text-slate-400 py-8 text-center">Загружаем...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unis.map((u, i) => (
                <div key={u.id}
                  className={`card p-4 hover:shadow-md transition-all duration-200
                    animate-fade-up opacity-0 stagger-${Math.min(i + 1, 8)}`}
                  style={{ animationFillMode: "forwards" }}>
                  <p className="text-xs text-slate-400 mb-1">{u.city}</p>
                  <p className="text-sm font-semibold text-slate-900 leading-snug mb-2">{u.name}</p>

                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    <div className="bg-green-50 rounded-lg p-1.5 text-center">
                      <p className="text-xs text-green-600">Бюджет</p>
                      <p className="text-sm font-semibold text-green-800">{u.min_score || "—"}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-1.5 text-center">
                      <p className="text-xs text-amber-600">Стоимость</p>
                      <p className="text-xs font-semibold text-amber-800">
                        {u.tuition_fee ? (u.tuition_fee / 1000).toFixed(0) + "к ₽" : "—"}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/university/${u.id}`}
                    className="block text-center text-xs font-medium text-brand-600
                               hover:text-brand-700 hover:bg-brand-50 py-1.5 rounded-lg
                               transition-colors border border-brand-100"
                  >
                    Подробнее →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}