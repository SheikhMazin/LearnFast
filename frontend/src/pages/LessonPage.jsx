function LessonPage({ topic, language, difficulty, lessonText, questionNum, totalQuestions, streak, onReady }) {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex flex-col">

      {/* Progress bar */}
      <div className="px-6 pt-5 pb-3 flex items-center gap-4">
        <span className="text-gray-400 text-sm whitespace-nowrap">Question {questionNum} of {totalQuestions}</span>
        <div className="flex-1 h-1.5 bg-gray-700 rounded-full">
          <div
            className="h-1.5 bg-blue-500 rounded-full transition-all"
            style={{ width: `${(questionNum / totalQuestions) * 100}%` }}
          />
        </div>
        <span className="text-orange-400 text-sm font-medium whitespace-nowrap">🔥 {streak} streak</span>
      </div>

      {/* Title + badges */}
      <div className="px-6 py-3 flex items-center gap-3">
        <h2 className="text-xl font-bold">{topic}</h2>
        <span className="px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700 text-blue-300 text-xs">{language}</span>
        <span className="px-3 py-1 rounded-full bg-green-900/50 border border-green-700 text-green-300 text-xs">{difficulty}</span>
      </div>

      {/* Lesson card */}
      <div className="flex-1 px-6 py-4">
        <div className="bg-[#1c1f2e] border border-gray-700 rounded-2xl p-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Your Lesson</p>
          <p className="text-white text-base leading-relaxed">{lessonText}</p>
        </div>
      </div>

      {/* Ready button */}
      <div className="px-6 pb-8">
        <button
          onClick={onReady}
          className="w-full py-3.5 rounded-xl border border-gray-600 text-white font-semibold hover:bg-white hover:text-black transition-all"
        >
          ⚡ I'm ready — give me a challenge
        </button>
      </div>
    </div>
  );
}

export default LessonPage;