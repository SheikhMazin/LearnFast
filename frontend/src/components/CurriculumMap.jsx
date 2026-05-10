import { CheckIcon, LockIcon, RefreshIcon } from "./Icons";

const STATUS_CONFIG = {
  complete:    { icon: <CheckIcon className="w-3 h-3" />, ink: "var(--success)", bg: "#e6f2e0", border: "#9cc98a" },
  in_progress: { icon: <span style={{ fontSize: "8px" }}>&#9654;</span>, ink: "var(--green)", bg: "#eef5e8", border: "var(--green)" },
  locked:      { icon: <LockIcon className="w-3 h-3" />, ink: "var(--ink-muted)", bg: "transparent", border: "var(--card-line)" },
  rolled_back: { icon: <RefreshIcon className="w-3 h-3" />, ink: "var(--warning)", bg: "#f5f0e0", border: "#c8a84a" },
};

function CurriculumMap({ curriculum, topic }) {
  if (!curriculum || curriculum.length === 0) return null;

  return (
    <aside className="w-52 flex-shrink-0 py-6 px-4 hidden lg:flex flex-col sidebar">
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-dim)" }}>Curriculum</p>
      <p className="text-sm font-semibold mb-5 truncate font-title text-xl" style={{ color: "var(--green-light)" }}>
        {topic}
      </p>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {curriculum.map((node) => {
          const status = node.status || "locked";
          const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.locked;
          return (
            <div
              key={node.id}
              className="flex items-start gap-2 px-2.5 py-2 text-xs transition-all"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.ink,
                borderRadius: "3px 8px 6px 3px / 4px 3px 8px 4px",
              }}
            >
              <span className="flex-shrink-0 mt-0.5" style={{ color: cfg.ink }}>{cfg.icon}</span>
              <span className="leading-snug">{node.concept}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          {curriculum.filter((n) => n.status === "complete").length} /{" "}
          {curriculum.length} complete
        </p>
      </div>
    </aside>
  );
}

export default CurriculumMap;
