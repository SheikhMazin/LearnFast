import { useState } from "react";

const LETTERS = ["A", "B", "C", "D"];

function MultipleChoice({ question, options, onSubmit }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-white text-base leading-snug font-medium">{question}</p>

      <div className="flex flex-col gap-2">
        {options?.map((opt, i) => {
          const label = opt.replace(/^[A-Da-d][.)]\s*/, "");
          const isSelected = selected === opt;
          return (
            <button
              key={i}
              onClick={() => setSelected(opt)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-600/15 text-white"
                  : "border-gray-700/80 bg-[#0f1117] text-gray-300 hover:border-gray-600 hover:text-white"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isSelected ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500"
                }`}
              >
                {LETTERS[i]}
              </span>
              <span className="text-sm">{label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => selected && onSubmit(selected)}
        disabled={!selected}
        className="w-full py-3 rounded-xl border border-gray-600 text-white font-medium hover:bg-white hover:text-black transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Submit answer
      </button>
    </div>
  );
}

export default MultipleChoice;
