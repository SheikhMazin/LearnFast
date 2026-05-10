function FeedbackPage({ isCorrect, userAnswer, feedback, onNext, onReviewLesson }) {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex flex-col items-center justify-center px-6">

      {/* Correct/Incorrect toggle */}
      <div className="flex gap-3 mb-8">
        <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${isCorrect ? "border-blue-500 bg-blue-600/20 text-blue-300" : "border-gray-700 text-gray-400"}`}>
          Correct answer
        </span>
        <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${!isCorrect ? "border-red-500 bg-red-600/20 text-red-300" : "border-gray-700 text-gray-400"}`}>
          Incorrect answer
        </span>
      </div>

      {/* Icon */}
      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-4 ${
        isCorrect ? "bg-green-900/50 border-2 border-green-500" : "bg-red-900/50 border-2 border-red-500"
      }`}>
        {isCorrect ? "✓" : "✗"}
      </div>

      <h2 className={`text-2xl font-bold mb-2 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
        {isCorrect ? "Correct!" : "Not quite!"}
      </h2>
      <p className="text-gray-400 text-sm mb-8">
        {isCorrect ? "Well done — keep that streak going." : "Don't worry, keep going!"}
      </p>

      {/* Your answer */}
      <div className="w-full max-w-md bg-[#1c1f2e] border border-gray-700 rounded-xl p-4 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Your Answer</p>
        <p className={`font-medium ${isCorrect ? "text-green-400" : "text-red-400"}`}>{userAnswer}</p>
      </div>

      {/* AI feedback */}
      <div className="w-full max-w-md bg-[#1c1f2e] border-l-4 border-blue-500 rounded-xl p-4 mb-8">
        <p className="text-xs text-blue-400 uppercase tracking-widest mb-2">⚡ AI Feedback</p>
        <p className="text-gray-300 text-sm leading-relaxed">{feedback}</p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-md grid grid-cols-2 gap-3">
        <button
          onClick={onNext}
          className="py-3 rounded-xl border border-gray-600 text-white font-medium hover:bg-white hover:text-black transition-all text-sm"
        >
          Next question →
        </button>
        <button
          onClick={onReviewLesson}
          className="py-3 rounded-xl border border-gray-600 text-white font-medium hover:bg-white hover:text-black transition-all text-sm"
        >
          Review lesson
        </button>
      </div>
    </div>
  );
}

export default FeedbackPage;