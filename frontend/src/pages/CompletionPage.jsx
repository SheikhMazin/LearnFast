const DIFF_LABEL = { 1: "Beginner", 2: "Elementary", 3: "Intermediate", 4: "Advanced", 5: "Expert" };

function StatBox({ label, value }) {
  return (
    <div className="bg-[#1c1f2e] border border-gray-700 rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function CompletionPage({ stats, onNewTopic }) {
  const s = stats || {};
  const accuracy = Math.round((s.accuracy || 0) * 100);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex flex-col items-center justify-center px-6">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold mb-2">Curriculum Complete!</h1>
      <p className="text-gray-400 mb-10">
        You mastered{" "}
        <span className="text-white font-medium">{s.topic}</span>{" "}
        in {s.language}
      </p>

      <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-8">
        <StatBox label="Questions" value={s.questions_answered ?? "—"} />
        <StatBox label="Accuracy" value={`${accuracy}%`} />
        <StatBox label="Best Streak" value={`🔥 ${s.current_streak ?? 0}`} />
        <StatBox label="Final Level" value={DIFF_LABEL[s.current_difficulty] ?? s.current_difficulty ?? "—"} />
        <StatBox label="Avg Time" value={`${(s.avg_time_seconds || 0).toFixed(1)}s`} />
        <StatBox label="Correct" value={`${s.total_correct ?? 0} / ${s.questions_answered ?? 0}`} />
      </div>

      <button
        onClick={onNewTopic}
        className="w-full max-w-md py-3.5 rounded-xl border border-gray-600 text-white font-semibold hover:bg-white hover:text-black transition-all"
      >
        Start a New Topic
      </button>
    </div>
  );
}

export default CompletionPage;
