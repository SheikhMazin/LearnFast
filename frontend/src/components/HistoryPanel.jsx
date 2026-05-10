import { useState, useEffect } from "react";
import { api } from "../api/client";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

function relativeDate(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function HistoryPanel({ onResume, onHome }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    api.listSessions()
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside
      className="flex-shrink-0 hidden lg:flex flex-col sidebar overflow-hidden"
      style={{
        width: collapsed ? "44px" : "208px",
        transition: "width 0.2s ease",
        paddingTop: "1.5rem",
        paddingBottom: "1.5rem",
        paddingLeft: collapsed ? "6px" : "1rem",
        paddingRight: collapsed ? "6px" : "1rem",
      }}
    >
      {/* Logo */}
      {!collapsed && (
        <button
          onClick={() => onHome?.()}
          className="font-title text-2xl mb-3 text-left leading-none"
          style={{
            color: "var(--green-light)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Vernā
        </button>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-center rounded transition-all mb-4 flex-shrink-0"
        style={{
          width: "28px",
          height: "28px",
          color: "var(--text-dim)",
          border: "1px solid var(--border)",
          background: "transparent",
          alignSelf: collapsed ? "center" : "flex-start",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text-muted)";
          e.currentTarget.style.borderColor = "var(--border-light)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-dim)";
          e.currentTarget.style.borderColor = "var(--border)";
        }}
        title={collapsed ? "Expand panel" : "Collapse panel"}
      >
        {collapsed ? <ChevronRightIcon className="w-3.5 h-3.5" /> : <ChevronLeftIcon className="w-3.5 h-3.5" />}
      </button>

      {!collapsed && (
        <>
          <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "var(--text-dim)" }}>
            Past Curriculums
          </p>

          <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
            {loading && (
              <div className="flex justify-center pt-6">
                <div
                  className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                  style={{ borderTopColor: "var(--green)" }}
                />
              </div>
            )}

            {!loading && sessions.length === 0 && (
              <p className="text-xs text-center pt-6 leading-relaxed" style={{ color: "var(--text-dim)" }}>
                No previous sessions yet.
                <br />Start learning something!
              </p>
            )}

            {!loading && sessions.map((s) => (
              <button
                key={s.session_id}
                onClick={() => onResume?.(s.topic, s.language, true)}
                className="w-full text-left px-3 py-2.5 transition-all"
                style={{
                  background: "transparent",
                  border: "1px solid transparent",
                  borderRadius: "3px 10px 8px 3px / 4px 3px 10px 4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--card)";
                  e.currentTarget.style.borderColor = "var(--card-border)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <p className="text-xs font-semibold truncate leading-snug" style={{ color: "var(--text-muted)" }}>
                  {s.topic}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-dim)", fontSize: "10px" }}>
                  {s.language} · {relativeDate(s.last_updated_at)}
                </p>
              </button>
            ))}
          </div>

          {!loading && sessions.length > 0 && (
            <div className="pt-4 mt-auto" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                {sessions.length} session{sessions.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </>
      )}
    </aside>
  );
}

export default HistoryPanel;
