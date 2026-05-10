import { useState } from "react";

const TAG_STYLES = {
  "Key term":             { color: "var(--green)",   bg: "#e8f2e0", border: "#9cc98a" },
  "Did you know":         { color: "var(--success)",  bg: "#ddeedd", border: "#7ab870" },
  "Common misconception": { color: "var(--error)",    bg: "#f2dede", border: "#c88a8a" },
  "Real-world link":      { color: "var(--warning)",  bg: "#f2edd8", border: "#c8a84a" },
};

function FlashCard({ data, onReady, isReadOnly }) {
  const [flipped, setFlipped] = useState(false);
  const { front, back, fact_tag, concept } = data;
  const tag = TAG_STYLES[fact_tag] || { color: "var(--ink-muted)", bg: "var(--card-2)", border: "var(--card-border)" };

  return (
    <div className="p-6 flex flex-col gap-5 min-h-72">
      <div className="flex items-center justify-between">
        <span
          className="px-2.5 py-0.5 text-xs font-medium"
          style={{
            color: tag.color,
            background: tag.bg,
            border: `1px solid ${tag.border}`,
            borderRadius: "3px 8px 6px 3px / 4px 3px 8px 4px",
          }}
        >
          {fact_tag || "Flashcard"}
        </span>
        {concept && (
          <span className="text-xs truncate max-w-48" style={{ color: "var(--ink-muted)" }}>{concept}</span>
        )}
      </div>

      {/* Flip area */}
      <div
        className="flex-1 cursor-pointer select-none"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.45s ease",
            position: "relative",
            minHeight: "140px",
          }}
        >
          {/* Front */}
          <div
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", position: "absolute", inset: 0 }}
            className="flex flex-col justify-center gap-2"
          >
            <p className="text-lg font-semibold leading-snug" style={{ color: "var(--ink)" }}>{front}</p>
            <p className="text-xs mt-2" style={{ color: "var(--ink-muted)" }}>Tap to reveal</p>
          </div>

          {/* Back */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              position: "absolute",
              inset: 0,
            }}
            className="flex flex-col justify-center gap-2"
          >
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--ink-muted)" }}>Explanation</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>{back}</p>
          </div>
        </div>
      </div>

      {flipped && !isReadOnly && (
        <button onClick={onReady} className="btn-outline w-full py-3 text-sm">
          Got it
        </button>
      )}
    </div>
  );
}

export default FlashCard;
