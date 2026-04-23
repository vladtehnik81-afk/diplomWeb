import { SUBJECTS } from "../data";
import SubjectRow from "./SubjectRow";
import { useSubjectScores } from "../hooks/useSubjectScores";

const FORM_TYPES = [
  { value: "all",    label: "Все варианты",  cls: "border-slate-200 text-slate-600 hover:bg-slate-50" },
  { value: "budget", label: "Бюджет",        cls: "border-green-200 text-green-700 hover:bg-green-50" },
  { value: "paid",   label: "Платное",       cls: "border-amber-200 text-amber-700 hover:bg-amber-50" },
];

export default function ScoreForm({ onSearch }) {
  const {
    entries, total, canSearch,
    availableSubjects, addEntry, removeEntry, updateEntry,
  } = useSubjectScores();

  const canAddMore = entries.length < SUBJECTS.length;

  return (
    <div className="card p-4 sm:p-6 w-full">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">
        Твои баллы ЕГЭ
      </p>

      <div className="flex flex-col gap-4 mb-3" style={{ overflow: "visible" }}>
        {entries.map((entry) => (
          <SubjectRow
            key={entry.id}
            entry={entry}
            availableSubjects={availableSubjects(entry.subject)}
            onUpdate={updateEntry}
            onRemove={removeEntry}
            showRemove={entries.length > 1}
          />
        ))}
      </div>

      {canAddMore && (
        <button
          onClick={addEntry}
          className="w-full py-2 mb-5 border border-dashed border-slate-200 rounded-xl
                     text-sm text-slate-400 hover:text-brand-600 hover:border-brand-300
                     hover:bg-brand-50 transition-all duration-150"
        >
          + Добавить предмет
        </button>
      )}

      <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 mb-5">
        <span className="text-sm text-slate-500">Сумма баллов</span>
        <span className="text-xl font-semibold text-slate-900 tabular-nums">{total}</span>
      </div>

      {/* Форма обучения */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2">Форма обучения</p>
        <div className="grid grid-cols-3 gap-2">
          {FORM_TYPES.map(({ value, label, cls }) => (
            <button
              key={value}
              disabled={!canSearch}
              onClick={() => canSearch && onSearch(total, value)}
              className={`py-2.5 rounded-xl text-sm font-medium border transition-all duration-150
                active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!canSearch && (
        <p className="text-xs text-slate-400 text-center mt-2">
          Заполни минимум 2 предмета
        </p>
      )}
    </div>
  );
}