import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import ScoreForm from "../components/ScoreForm.jsx";
import ResultsSection from "../components/ResultsSection.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { useScrollRevealGroup } from "../hooks/useScrollReveal.js";
import { AnimatedNumber } from "../hooks/useCountUp.jsx";
import { api } from "../api.js";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Введи баллы ЕГЭ",
    desc: "Выбери предметы которые сдавал и укажи количество баллов за каждый",
    color: "bg-blue-50 text-blue-700",
  },
  {
    step: "2",
    title: "Выбери форму обучения",
    desc: "Хочешь на бюджет или готов рассмотреть платное — нажми нужную кнопку",
    color: "bg-green-50 text-green-700",
  },
  {
    step: "3",
    title: "Получи список вузов",
    desc: "Смотри куда проходишь, сравнивай вузы и переходи на официальные сайты",
    color: "bg-purple-50 text-purple-700",
  },
];

const TAG_STYLES = {
  blue:   "bg-blue-50 text-blue-700",
  green:  "bg-green-50 text-green-700",
  amber:  "bg-amber-50 text-amber-700",
  teal:   "bg-teal-50 text-teal-700",
  purple: "bg-purple-50 text-purple-700",
};

export default function HomePage() {
  const [searchParams, setSearchParams] = useState(null);
  const resultsRef    = useRef(null);
  const howItWorksRef = useScrollRevealGroup();
  const topUnisRef    = useScrollRevealGroup();

  const { data: stats } = useFetch(() => api.getStats(), []);
  const { data: topUnis } = useFetch(
    () => api.getUniversities({ sortBy: "rating" }).then((d) => d.slice(0, 6)),
    []
  );

  function handleSearch(total, formType) {
    setSearchParams({ total, formType });
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  const displayStats = stats
    ? [
        { value: stats.universities,  label: "вузов в базе" },
        { value: stats.score_records, label: "записей о баллах" },
        { value: stats.cities,        label: "городов" },
      ]
    : [
        { value: "500+", label: "вузов в базе" },
        { value: "2025", label: "актуальный год" },
        { value: "100+", label: "городов" },
      ];

  return (
    <>
      {/* Герой */}
      <section className="relative bg-white border-b border-slate-100 overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-brand-50 opacity-60 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-40px] w-48 h-48 rounded-full bg-slate-100 opacity-50 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block tag bg-brand-50 text-brand-700 mb-4 text-xs">
              Приёмная кампания 2025
            </span>
            <h1
              className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4"
              style={{ fontFamily: "Unbounded, sans-serif" }}
            >
              Найди вуз
              <br />
              <span className="text-brand-600">по баллам ЕГЭ</span>
            </h1>
            <p className="text-slate-500 text-base max-w-md mx-auto lg:mx-0 mb-8">
              Введи баллы за предметы — покажем вузы, куда ты проходишь на
              бюджет или платное в 2025 году.
            </p>
            <div className="flex gap-6 justify-center lg:justify-start flex-wrap">
              {displayStats.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-xl font-semibold text-slate-900">
                    {typeof value === "number"
                      ? <AnimatedNumber value={value} duration={1400} />
                      : value}
                  </p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[440px]">
            <ScoreForm onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Результаты поиска */}
      <div ref={resultsRef}>
        {searchParams && (
          <ResultsSection
            total={searchParams.total}
            formType={searchParams.formType}
          />
        )}
      </div>

      {/* Блок "Как это работает" */}
      {!searchParams && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center mb-10">
            <h2
              className="text-2xl font-bold text-slate-900 mb-2"
              style={{ fontFamily: "Unbounded, sans-serif" }}
            >
              Как это работает
            </h2>
            <p className="text-sm text-slate-400">Три простых шага до списка подходящих вузов</p>
          </div>

          <div ref={howItWorksRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {HOW_IT_WORKS.map(({ step, title, desc, color }) => (
              <div key={step} className="card p-6 text-center reveal">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold mb-4 ${color}`}>
                  {step}
                </div>
                <p className="text-base font-semibold text-slate-900 mb-2">{title}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="btn-primary"
            >
              Начать подбор →
            </button>
          </div>
        </section>
      )}

      {/* Блок "Топ вузов" */}
      {!searchParams && topUnis && topUnis.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-100 py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2
                  className="text-2xl font-bold text-slate-900 mb-1"
                  style={{ fontFamily: "Unbounded, sans-serif" }}
                >
                  Топ вузов России
                </h2>
                <p className="text-sm text-slate-400">Лучшие университеты по рейтингу 2024 года</p>
              </div>
              <Link
                to="/universities"
                className="hidden sm:block text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Все вузы →
              </Link>
            </div>

            <div ref={topUnisRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topUnis.map((u, i) => (
                <Link
                  key={u.id}
                  to={`/university/${u.id}`}
                  className={`card p-5 hover:shadow-md transition-all duration-200 group
                    animate-fade-up opacity-0 stagger-${Math.min(i + 1, 6)}`}
                  style={{ animationFillMode: "forwards" }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <span className={`tag text-xs ${TAG_STYLES[u.tag_color] || TAG_STYLES.teal} mb-2`}>
                        {u.tag || "Вуз"}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-brand-600 transition-colors">
                        {u.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{u.city}</p>
                    </div>
                    <span className="text-2xl font-bold text-slate-100 flex-shrink-0">
                      #{u.rating}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-xl p-2 text-center">
                      <p className="text-xs text-slate-400 mb-0.5">Мин. балл</p>
                      <p className="text-sm font-semibold text-slate-800">
                        <AnimatedNumber value={u.min_score || 0} duration={1000} delay={i * 80} />
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 text-center">
                      <p className="text-xs text-slate-400 mb-0.5">Средний</p>
                      <p className="text-sm font-semibold text-slate-800">
                        <AnimatedNumber value={u.avg_score || 0} duration={1000} delay={i * 80 + 50} />
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 text-center">
                      <p className="text-xs text-slate-400 mb-0.5">Мест</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {u.budget_places
                          ? <><AnimatedNumber value={Math.round(u.budget_places / 100) * 100} duration={1000} delay={i * 80 + 100} /><span className="text-xs text-slate-400"></span></>
                          : "—"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-6 sm:hidden">
              <Link to="/universities" className="btn-ghost">
                Все вузы →
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}