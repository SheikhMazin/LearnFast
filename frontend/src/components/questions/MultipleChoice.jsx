import { useState } from "react";

const LETTERS = ["A", "B", "C", "D"];

function MultipleChoice({ question, options, onSubmit }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base leading-snug font-medium" style={{ color: "var(--ink)" }}>{question}</p>

      <div className="flex flex-col gap-2">
        {options?.map((opt, i) => {
          const label = opt.replace(/^[A-Da-d][.)]\s*/, "");
          const isSelected = selected === opt;
          return (
            <button
              key={i}
              onClick={() => setSelected(opt)}
              className={`option-btn flex items-center gap-3 px-4 py-3 text-left w-full ${isSelected ? "selected" : ""}`}
            >
              <span
                className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: isSelected ? "var(--green)" : "var(--card-2)",
                  border: `1px solid ${isSelected ? "var(--green)" : "var(--card-border)"}`,
                  color: isSelected ? "#fff" : "var(--ink-muted)",
                }}
              >
                {LETTERS[i]}
              </span>
              <span className="text-sm" style={{ color: "var(--ink)" }}>{label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => selected && onSubmit(LETTERS[options.indexOf(selected)])}
        disabled={!selected}
        className="btn-primary w-full py-3 text-sm"
      >
        Submit answer
      </button>
    </div>
  );
}

export default MultipleChoice;
