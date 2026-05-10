import { useState } from "react";

const TAG_STYLES = {
  "Key term":             "text-blue-400 border-blue-800/60 bg-blue-900/30",
  "Did you know":         "text-emerald-400 border-emerald-800/60 bg-emerald-900/30",
  "Common misconception": "text-rose-400 border-rose-800/60 bg-rose-900/30",
  "Real-world link":      "text-amber-400 border-amber-800/60 bg-amber-900/30",
};

function FlashCard({ data, onReady, isReadOnly }) {
  const [flipped, setFlipped] = useState(false);
  const { front, back, fact_tag, concept } = data;
  const tagCls = TAG_STYLES[fact_tag] || "text-gray-400 border-gray-700 bg-gray-800/40";

  return (
    <div className="p-6 flex flex-col gap-5 min-h-72">
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${tagCls}`}>
          {fact_tag || "Flashcard"}
        </span>
        {concept && (
          <span className="text-xs text-gray-600 truncate max-w-48">{concept}</span>
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
            <p className="text-white text-lg font-semibold leading-snug">{front}</p>
            <p className="text-gray-700 text-xs mt-2">Click to reveal →</p>
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
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Explanation</p>
            <p className="text-gray-200 text-sm leading-relaxed">{back}</p>
          </div>
        </div>
      </div>

      {flipped && !isReadOnly && (
        <button
          onClick={onReady}
          className="w-full py-3 rounded-xl border border-gray-600 text-white font-medium hover:bg-white hover:text-black transition-all text-sm"
        >
          Got it →
        </button>
      )}
    </div>
  );
}

export default FlashCard;
