import { useState } from "react";

function FillBlank({ question, onSubmit }) {
  const parts = (question || "").split("___");
  const blankCount = parts.length - 1;
  const hasBlank = blankCount > 0;

  // One value per blank — fixes all blanks sharing a single state
  const [values, setValues] = useState(() => Array(Math.max(blankCount, 1)).fill(""));

  const updateValue = (idx, val) => {
    setValues((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const allFilled = values.every((v) => v.trim());

  const handleSubmit = () => {
    if (!allFilled) return;
    onSubmit(values.map((v) => v.trim()).join(", "));
  };

  if (!hasBlank) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-base leading-snug font-medium" style={{ color: "var(--ink)" }}>{question}</p>
        <input
          type="text"
          value={values[0]}
          onChange={(e) => updateValue(0, e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && values[0].trim() && onSubmit(values[0].trim())}
          placeholder="Your answer..."
          className="w-full px-3 py-2.5 rounded text-sm"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1.5px solid var(--card-border)",
            color: "var(--ink)",
            outline: "none",
          }}
          autoFocus
        />
        <button
          onClick={() => values[0].trim() && onSubmit(values[0].trim())}
          disabled={!values[0].trim()}
          className="btn-primary w-full py-3 text-sm"
        >
          Submit answer
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="text-base leading-loose flex flex-wrap items-baseline gap-x-1 gap-y-2"
        style={{ color: "var(--ink)" }}
      >
        {parts.map((part, i) => (
          <span key={i}>
            <span>{part}</span>
            {i < blankCount && (
              <input
                type="text"
                value={values[i]}
                onChange={(e) => updateValue(i, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && allFilled && handleSubmit()}
                placeholder="___"
                className="ink-input inline-block mx-1 text-base text-center px-1 min-w-16"
                style={{
                  width: `${Math.max(values[i].length + 3, 8)}ch`,
                  color: "var(--green)",
                }}
                autoFocus={i === 0}
              />
            )}
          </span>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allFilled}
        className="btn-primary w-full py-3 text-sm"
      >
        Submit answer
      </button>
    </div>
  );
}

export default FillBlank;
