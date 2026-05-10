import { useState } from "react";

function FillBlank({ question, onSubmit }) {
  const [value, setValue] = useState("");

  const parts = (question || "").split("___");

  return (
    <div className="flex flex-col gap-6">
      <div className="text-white text-base leading-loose flex flex-wrap items-baseline gap-x-1 gap-y-2">
        {parts.map((part, i) => (
          <span key={i}>
            <span>{part}</span>
            {i < parts.length - 1 && (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && value.trim() && onSubmit(value.trim())}
                placeholder="___"
                className="inline-block mx-1 bg-transparent border-b-2 border-blue-500 text-blue-300 text-base text-center focus:outline-none px-1 min-w-16 transition-colors"
                style={{ width: `${Math.max(value.length + 3, 8)}ch` }}
                autoFocus
              />
            )}
          </span>
        ))}
      </div>

      <button
        onClick={() => value.trim() && onSubmit(value.trim())}
        disabled={!value.trim()}
        className="w-full py-3 rounded-xl border border-gray-600 text-white font-medium hover:bg-white hover:text-black transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Submit answer
      </button>
    </div>
  );
}

export default FillBlank;
