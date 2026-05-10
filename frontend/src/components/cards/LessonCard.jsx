import { FlameIcon, BoltIcon } from "../Icons";

const DIFF_LABEL = { 1: "Beginner", 2: "Elementary", 3: "Intermediate", 4: "Advanced", 5: "Expert" };

function LessonCard({ data, onReady, stats, isReadOnly }) {
  const { lesson, concept, difficulty } = data;

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>Lesson</span>
          {concept && (
            <span
              className="px-2.5 py-0.5 text-xs font-medium"
              style={{
                background: "#dff0d4",
                border: "1px solid var(--green)",
                color: "var(--green)",
                borderRadius: "3px 8px 6px 3px / 4px 3px 8px 4px",
              }}
            >
              {concept}
            </span>
          )}
          {difficulty && (
            <span
              className="px-2.5 py-0.5 text-xs"
              style={{
                background: "rgba(74,124,56,0.12)",
                border: "1px solid var(--green-muted)",
                color: "var(--ink-2)",
                borderRadius: "3px 8px 6px 3px / 4px 3px 8px 4px",
              }}
            >
              {DIFF_LABEL[difficulty] || `Lvl ${difficulty}`}
            </span>
          )}
        </div>
        {stats && (
          <span className="text-sm flex-shrink-0 flex items-center gap-1" style={{ color: "var(--warning)" }}>
            <FlameIcon className="w-3.5 h-3.5" />
            {stats.streak}
          </span>
        )}
      </div>

      <p className="text-base leading-relaxed" style={{ color: "var(--ink)" }}>{lesson}</p>

      {!isReadOnly && (
        <button onClick={onReady} className="btn-outline mt-auto w-full py-3 text-sm flex items-center justify-center gap-2">
          <BoltIcon className="w-3.5 h-3.5" />
          Ready for a challenge
        </button>
      )}
    </div>
  );
}

export default LessonCard;
