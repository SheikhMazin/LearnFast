import { useState } from "react";

function TrueFalse({ question, onSubmit }) {
  const [selected, setSelected] = useState(null);

  const pick = (val) => {
    if (selected) return;
    setSelected(val);
    setTimeout(() => onSubmit(val), 350);
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-white text-base leading-snug font-medium">{question}</p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => pick("True")}
          disabled={!!selected}
          className={`py-8 rounded-xl border text-xl font-bold transition-all ${
            selected === "True"
              ? "border-emerald-500 bg-emerald-900/40 text-emerald-400"
              : selected
              ? "border-gray-800 bg-[#0f1117] text-gray-700 cursor-not-allowed"
              : "border-gray-700 bg-[#0f1117] text-gray-300 hover:border-emerald-600 hover:bg-emerald-900/20 hover:text-emerald-400"
          }`}
        >
          ✓ True
        </button>
        <button
          onClick={() => pick("False")}
          disabled={!!selected}
          className={`py-8 rounded-xl border text-xl font-bold transition-all ${
            selected === "False"
              ? "border-rose-500 bg-rose-900/40 text-rose-400"
              : selected
              ? "border-gray-800 bg-[#0f1117] text-gray-700 cursor-not-allowed"
              : "border-gray-700 bg-[#0f1117] text-gray-300 hover:border-rose-600 hover:bg-rose-900/20 hover:text-rose-400"
          }`}
        >
          ✗ False
        </button>
      </div>
    </div>
  );
}

export default TrueFalse;
