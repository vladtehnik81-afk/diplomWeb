import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { useNavigate } from "react-router-dom";
import { useToast } from "./Toast.jsx";

export default function FavoriteButton({ universityId, className = "" }) {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const toast     = useToast();
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [burst,   setBurst]   = useState(false);

  useEffect(() => {
    if (!user) return;
    api.getFavoriteIds()
      .then((ids) => setSaved(ids.includes(universityId)))
      .catch(() => {});
  }, [user, universityId]);

  async function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    if (loading) return;
    setLoading(true);
    try {
      if (saved) {
        await api.removeFavorite(universityId);
        setSaved(false);
        toast("Убрано из избранного", "info");
      } else {
        await api.addFavorite(universityId);
        setSaved(true);
        setBurst(true);
        setTimeout(() => setBurst(false), 600);
        toast("Добавлено в избранное ♥", "success");
      }
    } catch {
      toast("Что-то пошло не так", "error");
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? "Убрать из избранного" : "Добавить в избранное"}
      className={`relative flex items-center justify-center w-8 h-8 rounded-lg
                  transition-all duration-200 disabled:opacity-50
                  ${saved ? "bg-red-50 hover:bg-red-100" : "bg-slate-50 hover:bg-slate-100"}
                  ${className}`}
      style={{ transform: burst ? "scale(1.3)" : "scale(1)", transition: "transform 0.2s cubic-bezier(.22,.68,0,1.5), background 0.15s" }}
    >
      <svg
        width="16" height="16"
        viewBox="0 0 24 24"
        fill={saved ? "#ef4444" : "none"}
        stroke={saved ? "#ef4444" : "#94a3b8"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: "fill 0.2s ease, stroke 0.2s ease, transform 0.3s cubic-bezier(.22,.68,0,1.5)",
          transform: burst ? "scale(1.2)" : "scale(1)",
        }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>

      {/* Частицы при добавлении */}
      {burst && (
        <>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <span
              key={deg}
              style={{
                position: "absolute",
                width: 4, height: 4,
                borderRadius: "50%",
                background: "#ef4444",
                transform: `rotate(${deg}deg) translateY(-14px)`,
                animation: "particle 0.5s ease-out forwards",
                opacity: 0,
              }}
            />
          ))}
        </>
      )}

      <style>{`
        @keyframes particle {
          0%   { opacity: 1; transform: rotate(var(--r, 0deg)) translateY(-8px) scale(1); }
          100% { opacity: 0; transform: rotate(var(--r, 0deg)) translateY(-18px) scale(0); }
        }
      `}</style>
    </button>
  );
}