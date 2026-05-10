const DIFF_LABEL = { 1: "Beginner", 2: "Elementary", 3: "Intermediate", 4: "Advanced", 5: "Expert" };

function LessonCard({ data, onReady, stats, isReadOnly }) {
  const { lesson, concept, difficulty } = data;

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Lesson</span>
          {concept && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-900/40 border border-blue-800/60 text-blue-300 text-xs">
              {concept}
            </span>
          )}
          {difficulty && (
            <span className="px-2.5 py-0.5 rounded-full bg-purple-900/40 border border-purple-800/60 text-purple-300 text-xs">
              {DIFF_LABEL[difficulty] || `Lvl ${difficulty}`}
            </span>
          )}
        </div>
        {stats && (
          <span className="text-orange-400 text-sm flex-shrink-0">🔥 {stats.streak}</span>
        )}
      </div>

      <p className="text-white text-base leading-relaxed">{lesson}</p>

      {!isReadOnly && (
        <button
          onClick={onReady}
          className="mt-auto w-full py-3 rounded-xl border border-gray-600 text-white font-medium hover:bg-white hover:text-black transition-all text-sm"
        >
          Ready for a challenge ⚡
        </button>
      )}
    </div>
  );
}

export default LessonCard;
