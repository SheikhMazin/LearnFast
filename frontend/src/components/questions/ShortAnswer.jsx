import { useState } from "react";

function ShortAnswer({ question, onSubmit }) {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-white text-base leading-snug font-medium">{question}</p>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write your answer here..."
        rows={4}
        className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm resize-none transition-colors"
        autoFocus
      />

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

export default ShortAnswer;
