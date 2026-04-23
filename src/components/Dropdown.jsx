import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function Dropdown({ value, onChange, options, placeholder = "Все", label }) {
  const [open,    setOpen]    = useState(false);
  const [pos,     setPos]     = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const listRef   = useRef(null);

  const selected     = options.find((o) => (o.value ?? o) === value);
  const displayLabel = selected ? (selected.label ?? selected) : placeholder;

  // Позиция списка — вычисляем при открытии
  function openDropdown() {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top:   rect.bottom + window.scrollY + 4,
        left:  rect.left   + window.scrollX,
        width: rect.width,
      });
    }
    setOpen(true);
  }

  // Закрываем при клике вне
  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        listRef.current   && !listRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Обновляем позицию при скролле страницы
  useEffect(() => {
    if (!open) return;
    function updatePos() {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPos({
          top:   rect.bottom + window.scrollY + 4,
          left:  rect.left   + window.scrollX,
          width: rect.width,
        });
      }
    }
    window.addEventListener("scroll", updatePos, true);
    return () => window.removeEventListener("scroll", updatePos, true);
  }, [open]);

  function select(val) {
    onChange(val);
    setOpen(false);
  }

  return (
    <div className="flex-1 min-w-[130px]">
      {label && <p className="text-xs text-slate-400 mb-1.5">{label}</p>}

      {/* Кнопка */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => open ? setOpen(false) : openDropdown()}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5
                    border rounded-xl text-sm bg-white transition-all duration-150
                    ${open
                      ? "border-brand-400 ring-2 ring-brand-100"
                      : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
      >
        <span className={`truncate ${value ? "text-slate-900" : "text-slate-400"}`}>
          {displayLabel}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Список — рендерится в body через портал */}
      {open && createPortal(
        <div
          ref={listRef}
          className="animate-slide-down"
          style={{
            position:  "absolute",
            top:       pos.top,
            left:      pos.left,
            width:     pos.width,
            maxWidth:  "260px",
            zIndex:    9999,
            background: "white",
            border:    "1px solid #f1f5f9",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            overflow:  "hidden",
          }}
        >
          <div style={{ maxHeight: "224px", overflowY: "auto", padding: "4px 0" }}>
            <button
              type="button"
              onClick={() => select("")}
              style={{
                width: "100%", textAlign: "left",
                padding: "8px 12px", fontSize: "14px",
                background: !value ? "#eff6ff" : "transparent",
                color: !value ? "#1d4ed8" : "#64748b",
                fontWeight: !value ? "500" : "400",
                border: "none", cursor: "pointer",
              }}
              onMouseEnter={(e) => { if (value) e.target.style.background = "#f8fafc"; }}
              onMouseLeave={(e) => { if (value) e.target.style.background = "transparent"; }}
            >
              {placeholder}
            </button>

            {options.map((opt) => {
              const val    = opt.value ?? opt;
              const lbl    = opt.label ?? opt;
              const active = val === value;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => select(val)}
                  style={{
                    width: "100%", textAlign: "left",
                    padding: "8px 12px", fontSize: "14px",
                    display: "flex", alignItems: "center", gap: "8px",
                    background: active ? "#eff6ff" : "transparent",
                    color: active ? "#1d4ed8" : "#334155",
                    fontWeight: active ? "500" : "400",
                    border: "none", cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  {active ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M2 6L5 9L10 3" stroke="#2563eb" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span style={{ width: "20px", flexShrink: 0 }} />
                  )}
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}