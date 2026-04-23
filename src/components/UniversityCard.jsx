import { Link } from "react-router-dom";

const TAG_STYLES = {
  blue:   "bg-blue-50 text-blue-700",
  green:  "bg-green-50 text-green-700",
  amber:  "bg-amber-50 text-amber-700",
  teal:   "bg-teal-50 text-teal-700",
  purple: "bg-purple-50 text-purple-700",
  red:    "bg-red-50 text-red-700",
};

export default function UniversityCard({ university, total, formType = "all", index }) {
  const {
    id, name, city, direction,
    min_score, avg_score, min_score_paid, tuition_fee, budget_places,
    tag, tag_color,
  } = university;

  const minScore  = min_score      || 180;
  const avgScore  = avg_score      || minScore + 15;
  const minPaid   = min_score_paid || minScore - 60;
  const tuition   = tuition_fee    || 200000;
  const places    = budget_places  || 0;

  const onBudget   = total >= avgScore;
  const borderline = total >= minScore && total < avgScore;
  const canPay     = total >= minPaid  && total < minScore;

  const statusColor = onBudget
    ? "text-green-600"
    : borderline
    ? "text-amber-600"
    : canPay
    ? "text-orange-500"
    : "text-red-500";

  const statusText = onBudget
    ? "✓ Бюджет — проходишь"
    : borderline
    ? "~ На границе бюджета"
    : canPay
    ? "💳 Только платное"
    : `✗ Не хватает ${minPaid - total} б. даже на платное`;

  const barBase  = onBudget || borderline ? avgScore : minPaid;
  const barPct   = Math.round(Math.min(100, (total / barBase) * 100));
  const barColor = onBudget ? "bg-green-500" : borderline ? "bg-amber-400" : canPay ? "bg-orange-400" : "bg-red-400";

  return (
    <div
      className={`card p-4 flex flex-col gap-3 hover:shadow-md transition-all duration-200
                  animate-fade-up opacity-0 stagger-${Math.min(index + 1, 8)}
                  ${onBudget ? "ring-1 ring-green-200" : canPay && !borderline ? "ring-1 ring-amber-100" : ""}`}
      style={{ animationFillMode: "forwards" }}
    >
      <div className="flex-1 min-w-0">
        <span className={`tag ${TAG_STYLES[tag_color] || TAG_STYLES.blue} mb-1`}>{tag || "Вуз"}</span>
        <h3 className="text-sm font-semibold text-slate-900 leading-snug">{name}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{city} · {direction}</p>
      </div>

      {/* Баллы */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-green-50 rounded-xl p-2 text-center">
          <p className="text-xs text-green-600 mb-0.5">Бюджет от</p>
          <p className="text-sm font-semibold text-green-800 tabular-nums">{minScore}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-2 text-center">
          <p className="text-xs text-amber-600 mb-0.5">Платное от</p>
          <p className="text-sm font-semibold text-amber-800 tabular-nums">{minPaid}</p>
        </div>
      </div>

      {/* Цена */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Стоимость в год</span>
        <span className="font-semibold text-slate-700">
          {tuition.toLocaleString("ru-RU")} ₽
        </span>
      </div>

      {/* Прогресс */}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${barPct}%` }}
        />
      </div>

      <p className={`text-xs font-medium ${statusColor}`}>{statusText}</p>

      <div className="flex items-center justify-between mt-auto pt-1 border-t border-slate-50">
        <p className="text-xs text-slate-400">
          {places ? `${places.toLocaleString("ru-RU")} бюдж. мест` : "нет данных"}
        </p>
        <Link
          to={`/university/${id}?total=${total}`}
          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
        >
          Подробнее →
        </Link>
      </div>
    </div>
  );
}