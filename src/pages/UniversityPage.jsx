import { useParams, useSearchParams, Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useFetch } from "../hooks/useFetch.js";
import { api } from "../api.js";
import FavoriteButton from "../components/FavoriteButton.jsx";
import { UniversityPageSkeleton } from "../components/Skeleton.jsx";
import { AnimatedNumber } from "../hooks/useCountUp.jsx";

const TAG_STYLES = {
  blue:   "bg-blue-50 text-blue-700",
  green:  "bg-green-50 text-green-700",
  amber:  "bg-amber-50 text-amber-700",
  teal:   "bg-teal-50 text-teal-700",
  purple: "bg-purple-50 text-purple-700",
};

// Разные заглушки по городам
const FALLBACK_BY_CITY = {
  "Москва":          "https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=900&q=80",
  "Санкт-Петербург": "https://images.unsplash.com/photo-1556519713-3c5258e1fdac?w=900&q=80",
  "Казань":          "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=900&q=80",
  "Екатеринбург":    "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=900&q=80",
  "Новосибирск":     "https://images.unsplash.com/photo-1562774053-701939374585?w=900&q=80",
  "Томск":           "https://images.unsplash.com/photo-1562774053-701939374585?w=900&q=80",
};
const FALLBACK_DEFAULT = "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=900&q=80";

export default function UniversityPage() {
  const { id }         = useParams();
  const [searchParams] = useSearchParams();
  const total          = parseInt(searchParams.get("total") || "0", 10);
  const chartRef       = useRef(null);

  const { data: university, loading, error } = useFetch(() => api.getUniversity(id), [id]);
  const { data: scores }                     = useFetch(() => api.getScores(id), [id]);
  const { data: photoData }                  = useFetch(() => api.getPhoto(id), [id]);

  useEffect(() => {
    if (!scores || !chartRef.current || scores.length === 0) return;
    const canvas = chartRef.current;
    const ctx    = canvas.getContext("2d");
    const data   = scores.map((s) => s.avg_score).filter(Boolean);
    const years  = scores.map((s) => s.year);
    if (data.length === 0) return;

    const W = canvas.offsetWidth;
    const H = 180;
    canvas.width  = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const padL = 40, padR = 20, padT = 20, padB = 30;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const minVal = Math.min(...data) - 10;
    const maxVal = Math.max(...data) + 10;
    const xPos = (i) => padL + (i / (data.length - 1)) * chartW;
    const yPos = (v) => padT + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

    ctx.strokeStyle = "#f1f5f9"; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (i / 4) * chartH;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(data[0]));
    data.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
    ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(data[0]));
    data.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
    ctx.lineTo(xPos(data.length - 1), padT + chartH);
    ctx.lineTo(xPos(0), padT + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
    grad.addColorStop(0, "rgba(59,130,246,0.15)");
    grad.addColorStop(1, "rgba(59,130,246,0)");
    ctx.fillStyle = grad; ctx.fill();

    ctx.font = "11px sans-serif"; ctx.textAlign = "center";
    data.forEach((v, i) => {
      const x = xPos(i), y = yPos(v);
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#fff"; ctx.fill();
      ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#475569"; ctx.fillText(v, x, y - 10);
      ctx.fillStyle = "#94a3b8"; ctx.fillText(years[i], x, padT + chartH + 18);
    });
  }, [scores]);

  if (loading) return <UniversityPageSkeleton />;

  if (error || !university) return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate-400">
      <p className="text-lg mb-4">Вуз не найден</p>
      <Link to="/" className="btn-primary">На главную</Link>
    </div>
  );

  const {
    name, city, direction, website,
    tag, tag_color,
    min_score, avg_score, min_score_paid, tuition_fee, budget_places,
  } = university;

  const minScore = min_score      || 180;
  const avgScore = avg_score      || minScore + 15;
  const minPaid  = min_score_paid || minScore - 60;
  const tuition  = tuition_fee    || 200000;

  const passing    = total >= avgScore;
  const borderline = total >= minScore && total < avgScore;

  const statusColor = passing
    ? "text-green-600 bg-green-50"
    : borderline
    ? "text-amber-600 bg-amber-50"
    : "text-red-500 bg-red-50";

  const statusText = total === 0 ? "" : passing
    ? "Проходишь уверенно"
    : borderline
    ? "На границе"
    : `Не хватает ${minScore - total} баллов`;

  // Фото — из API (Wikimedia), иначе заглушка по городу
  const photo = photoData?.photo_url || FALLBACK_BY_CITY[city] || FALLBACK_DEFAULT;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in opacity-0"
         style={{ animationFillMode: "forwards" }}>
      <Link
        to={total ? `/?total=${total}` : "/"}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-6 transition-colors"
      >
        ← Назад
      </Link>

      {/* Шапка с фото */}
      <div className="card mb-6 overflow-hidden animate-fade-up opacity-0" style={{ animationFillMode: "forwards", animationDelay: "0s" }}>
        <div className="relative min-h-[180px]">

          {/* Фото на весь фон */}
          <img
            src={photo}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover object-center"
            onError={(e) => { e.target.src = FALLBACK_BY_CITY[city] || FALLBACK_DEFAULT; }}
          />

          {/* Градиент слева — белый переходит в прозрачный */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, #ffffff 0%, #ffffff 35%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.3) 70%, transparent 100%)",
            }}
          />

          {/* Контент поверх */}
          <div className="relative z-10 p-6 max-w-[60%]">
            <span className={`tag ${TAG_STYLES[tag_color] || TAG_STYLES.teal} mb-3`}>{tag || "Вуз"}</span>
            <h1 className="text-xl font-semibold text-slate-900 mb-1 leading-tight">{name}</h1>
            <p className="text-sm text-slate-400 mb-4">{city} · {direction}</p>

            <div className="flex flex-wrap gap-2">
              {total > 0 && statusText && (
                <span className={`tag text-sm px-3 py-1.5 ${statusColor}`}>
                  {statusText}
                </span>
              )}
              {website && (
                <a
                  href={website} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200
                             text-sm font-medium text-slate-600 hover:text-brand-600 hover:border-brand-200
                             hover:bg-white transition-all duration-150 bg-white/80"
                >
                  Официальный сайт ↗
                </a>
              )}
              <FavoriteButton universityId={university.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Ключевые показатели */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-fade-up opacity-0"
           style={{ animationFillMode: "forwards", animationDelay: "0.1s" }}>
        {[
          { label: "Мин. балл (бюджет)",  value: minScore, delay: 200  },
          { label: "Мин. балл (платное)", value: minPaid,  delay: 300  },
          { label: "Бюдж. мест",          value: budget_places, delay: 400 },
          { label: "Твои баллы",          value: total || null, delay: 500 },
        ].map(({ label, value, delay }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="text-xl font-semibold text-slate-900 tabular-nums">
              {value
                ? <AnimatedNumber value={value} duration={1000} delay={delay} />
                : "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Стоимость */}
      <div className="card p-6 mb-6 animate-fade-up opacity-0"
           style={{ animationFillMode: "forwards", animationDelay: "0.2s" }}>
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Стоимость обучения 2025</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-xs text-green-600 font-medium mb-1">Бюджет</p>
            <p className="text-2xl font-semibold text-green-800">Бесплатно</p>
            <p className="text-xs text-green-600 mt-1">Нужно набрать от {minScore} баллов</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4">
            <p className="text-xs text-amber-600 font-medium mb-1">Платное отделение</p>
            <p className="text-2xl font-semibold text-amber-800">
              <AnimatedNumber value={tuition} duration={1200} delay={400} /> ₽
            </p>
            <p className="text-xs text-amber-600 mt-1">в год · от {minPaid} баллов</p>
          </div>
        </div>
        {total > 0 && (
          <div className={`mt-4 p-3 rounded-xl text-sm font-medium
            ${total >= minScore
              ? "bg-green-50 text-green-700"
              : total >= minPaid
              ? "bg-amber-50 text-amber-700"
              : "bg-red-50 text-red-600"}`}>
            {total >= minScore
              ? `✓ Твоих ${total} баллов хватает на бюджет`
              : total >= minPaid
              ? `💳 Твоих ${total} баллов хватает только на платное (${tuition.toLocaleString("ru-RU")} ₽/год)`
              : `✗ Не хватает ${minPaid - total} б. даже для платного`}
          </div>
        )}
      </div>

      {/* График */}
      {scores && scores.length > 0 && (
        <div className="card p-6 mb-6 animate-fade-up opacity-0"
             style={{ animationFillMode: "forwards", animationDelay: "0.3s" }}>
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Динамика среднего проходного балла
          </h2>
          <canvas ref={chartRef} className="w-full" style={{ height: 180 }} />
        </div>
      )}

      {/* Шансы */}
      {total > 0 && (
        <div className="card p-6 animate-fade-up opacity-0"
             style={{ animationFillMode: "forwards", animationDelay: "0.4s" }}>
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Твои шансы</h2>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  passing ? "bg-green-500" : borderline ? "bg-amber-400" : "bg-red-400"
                }`}
                style={{ width: `${Math.round(Math.min(100, (total / avgScore) * 100))}%` }}
              />
            </div>
            <span className="text-sm tabular-nums text-slate-600 w-16 text-right">
              {Math.round(Math.min(100, (total / avgScore) * 100))}%
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Твои {total} б. от среднего проходного {avgScore} б.
          </p>
        </div>
      )}
    </div>
  );
}