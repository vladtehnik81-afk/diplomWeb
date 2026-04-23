import Dropdown from "./Dropdown.jsx";

export default function SubjectRow({ entry, availableSubjects, onUpdate, onRemove, showRemove }) {
  const scoreVal = parseInt(entry.score, 10);
  const hasError = entry.score !== "" && (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100);

  return (
    <div className="flex items-center gap-2 animate-fade-up opacity-0"
         style={{ animationFillMode: "forwards", position: "relative", zIndex: 0 }}>

      {/* Выбор предмета через кастомный Dropdown */}
      <div className="flex-1 min-w-0 relative">
        <Dropdown
          value={entry.subject}
          onChange={(val) => onUpdate(entry.id, "subject", val)}
          placeholder="— выбери предмет —"
          options={availableSubjects}
        />
      </div>

      {/* Поле баллов */}
      <div className="relative flex-shrink-0">
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          placeholder="0–100"
          value={entry.score}
          onChange={(e) => onUpdate(entry.id, "score", e.target.value)}
          className={`input-base w-20 text-center text-sm ${
            hasError ? "border-red-300 focus:ring-red-300 bg-red-50" : ""
          }`}
        />
        {hasError && (
          <p className="absolute -bottom-5 left-0 text-xs text-red-500 whitespace-nowrap">
            0–100
          </p>
        )}
      </div>

      {/* Кнопка удаления */}
      {showRemove ? (
        <button
          onClick={() => onRemove(entry.id)}
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg
                     border border-slate-200 text-slate-400
                     hover:border-red-200 hover:text-red-400 hover:bg-red-50
                     transition-all duration-150 text-base"
          aria-label="Удалить"
        >×</button>
      ) : (
        <div className="w-8 flex-shrink-0" />
      )}
    </div>
  );
}