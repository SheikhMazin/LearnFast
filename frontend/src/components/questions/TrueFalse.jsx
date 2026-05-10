import { useState } from "react";
import { CheckIcon, XIcon } from "../Icons";

function TrueFalse({ question, onSubmit }) {
  const [selected, setSelected] = useState(null);

  const pick = (val) => {
    if (selected) return;
    setSelected(val);
    setTimeout(() => onSubmit(val), 350);
  };

  const btnStyle = (val) => {
    if (val === "True") {
      if (selected === "True") return { background: "#dff0d4", border: "2px solid var(--success)", color: "var(--success)" };
      if (selected) return { background: "var(--card-2)", border: "1.5px solid var(--card-line)", color: "var(--ink-muted)", opacity: 0.5 };
      return { background: "var(--card)", border: "1.5px solid var(--card-border)", color: "var(--ink)" };
    } else {
      if (selected === "False") return { background: "#f0dede", border: "2px solid var(--error)", color: "var(--error)" };
      if (selected) return { background: "var(--card-2)", border: "1.5px solid var(--card-line)", color: "var(--ink-muted)", opacity: 0.5 };
      return { background: "var(--card)", border: "1.5px solid var(--card-border)", color: "var(--ink)" };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-base leading-snug font-medium" style={{ color: "var(--ink)" }}>{question}</p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => pick("True")}
          disabled={!!selected}
          className="py-8 text-xl font-bold transition-all flex flex-col items-center gap-2"
          style={{ ...btnStyle("True"), borderRadius: "4px 12px 8px 4px / 6px 4px 12px 6px", cursor: selected ? "not-allowed" : "pointer" }}
        >
          <CheckIcon className="w-6 h-6" />
          True
        </button>
        <button
          onClick={() => pick("False")}
          disabled={!!selected}
          className="py-8 text-xl font-bold transition-all flex flex-col items-center gap-2"
          style={{ ...btnStyle("False"), borderRadius: "4px 12px 8px 4px / 6px 4px 12px 6px", cursor: selected ? "not-allowed" : "pointer" }}
        >
          <XIcon className="w-6 h-6" />
          False
        </button>
      </div>
    </div>
  );
}

export default TrueFalse;
