import { useState } from "react";

function ShortAnswer({ question, onSubmit }) {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base leading-snug font-medium" style={{ color: "var(--ink)" }}>{question}</p>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write your answer here..."
        rows={4}
        className="paper-textarea w-full px-4 py-3 text-sm"
        autoFocus
      />

      <button
        onClick={() => value.trim() && onSubmit(value.trim())}
        disabled={!value.trim()}
        className="btn-primary w-full py-3 text-sm"
      >
        Submit answer
      </button>
    </div>
  );
}

export default ShortAnswer;
