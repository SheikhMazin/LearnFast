import { useState } from "react";
import { useTranslation } from "react-i18next";

function FillBlank({ question, onSubmit }) {
  const { t } = useTranslation();
  const rawParts = (question || "").split("___");
  // Enforce exactly one blank: merge any trailing segments so there's only 1 input
  const parts = rawParts.length > 2
    ? [rawParts[0], rawParts.slice(1).join("")]
    : rawParts;
  const blankCount = parts.length - 1;
  const hasBlank = blankCount > 0;

  const [values, setValues] = useState([""]);

  const updateValue = (val) => setValues([val]);

  const allFilled = values[0].trim() !== "";

  const handleSubmit = () => {
    if (!allFilled) return;
    onSubmit(values[0].trim());
  };

  if (!hasBlank) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-base leading-snug font-medium" style={{ color: "var(--ink)" }}>{question}</p>
        <input
          type="text"
          value={values[0]}
          onChange={(e) => updateValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && values[0].trim() && onSubmit(values[0].trim())}
          placeholder={t("question.placeholder")}
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
          {t("question.submitAnswer")}
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
                onChange={(e) => updateValue(e.target.value)}
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
