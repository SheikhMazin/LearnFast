import { useState } from "react";

function ChallengePage({
  topic,
  language,
  difficulty,
  streak,
  question,
  options,
  questionNum,
  totalQuestions,
  onSubmit,
}) {
  const [selected, setSelected] = useState(null);

  const handleSubmit = () => {
    if (!selected) return;
    onSubmit(selected);
    setSelected(null);
  };

  if (!options || options.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f1117] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex flex-col px-6 py-6">
      {/* Badges row */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 rounded-full bg-purple-900/50 border border-purple-700 text-purple-300 text-xs">
          {difficulty}
        </span>
        <span className="text-orange-400 text-sm font-medium">
          🔥 {streak} streak
        </span>
      </div>

      {/* Topic + language */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-300 text-sm">{topic}</span>
        <span className="px-2 py-0.5 rounded-full bg-blue-900/50 border border-blue-700 text-blue-300 text-xs">
          {language}
        </span>
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold mb-6 leading-snug">{question}</h3>

      {/* Answer options */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {options.map((opt, i) => {
          const letters = ["A", "B", "C", "D"];
          const isSelected = selected === opt;
          return (
            <button
              key={i}
              onClick={() => setSelected(opt)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-600/20 text-white"
                  : "border-gray-700 bg-[#1c1f2e] text-gray-300 hover:border-gray-500"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {letters[i]}
              </span>
              <span className="text-sm">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!selected}
        className="w-full py-3.5 rounded-xl border border-gray-600 text-white font-semibold disabled:opacity-40 hover:bg-white hover:text-black transition-all"
      >
        Submit answer
      </button>
    </div>
  );
}

export default ChallengePage;
