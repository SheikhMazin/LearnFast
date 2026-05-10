function StatsPage({ topic, language, questionsAnswered, correct, streak, accuracy, avgTime, difficulty, onKeepGoing, onReset }) {
  const difficultyLevels = ["Beginner", "Easy", "Intermediate", "Hard", "Expert"];
  const diffIndex = difficultyLevels.indexOf(difficulty);
  const diffPercent = ((diffIndex) / (difficultyLevels.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white px-6 py-8">
      <h2 className="text-2xl font-bold mb-1">Session stats</h2>
      <p className="text-gray-400 text-sm mb-8">{topic} · {language} · Question {questionsAnswered} of 10</p>

      <div className="flex gap-6 mb-6">
        {/* Accuracy circle */}
        <div className="flex items-center justify-center w-28 h-28 rounded-full border-4 border-green-500 flex-shrink-0">
          <div className="text-center">
            <p className="text-2xl font-bold">{accuracy}%</p>
            <p className="text-xs text-gray-400">accuracy</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          <div className="bg-[#1c1f2e] rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Questions</p>
            <p className="text-xl font-bold">{questionsAnswered} <span className="text-sm text-gray-400 font-normal">answered</span></p>
          </div>
          <div className="bg-[#1c1f2e] rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Streak</p>
            <p className="text-xl font-bold text-orange-400">🔥 {streak}</p>
          </div>
          <div className="bg-[#1c1f2e] rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Avg Response</p>
            <p className="text-xl font-bold">{avgTime} <span className="text-sm text-gray-400 font-normal">sec</span></p>
          </div>
          <div className="bg-[#1c1f2e] rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Correct</p>
            <p className="text-xl font-bold">{correct} <span className="text-sm text-gray-400 font-normal">of {questionsAnswered}</span></p>
          </div>
        </div>
      </div>

      {/* Difficulty bar */}
      <div className="bg-[#1c1f2e] rounded-xl p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-300">Difficulty level</span>
          <span className="text-purple-400 text-sm font-medium">{difficulty} ({diffIndex + 1})</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full mb-2">
          <div className="h-2 bg-blue-500 rounded-full transition-all" style={{ width: `${diffPercent}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Beginner</span>
          <span>Intermediate</span>
          <span>Expert</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onKeepGoing}
          className="py-3 rounded-xl border border-gray-600 text-white font-medium hover:bg-white hover:text-black transition-all text-sm"
        >
          ⚡ Keep going
        </button>
        <button
          onClick={onReset}
          className="py-3 rounded-xl border border-gray-600 text-white font-medium hover:bg-white hover:text-black transition-all text-sm"
        >
          ↺ Reset session
        </button>
      </div>
    </div>
  );
}

export default StatsPage;