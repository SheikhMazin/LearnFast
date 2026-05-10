function FeedbackCard({ data, onNext, isReadOnly }) {
  const { isCorrect, feedback, userAnswer, correctAnswer, nextAction, nodeContext } = data;

  const transitionMsg = () => {
    if (nextAction === "advance") {
      const next = nodeContext?.concept || nodeContext?.next_concept;
      return next
        ? { text: `Moving on to: ${next}`, cls: "text-emerald-400" }
        : { text: "Great — next concept!", cls: "text-emerald-400" };
    }
    if (nextAction === "rollback") {
      const to = nodeContext?.rollback_to;
      return to
        ? { text: `Let's revisit: ${to}`, cls: "text-amber-400" }
        : { text: "Let's step back and revisit the foundation.", cls: "text-amber-400" };
    }
    if (nextAction === "curriculum_complete") {
      return { text: "You've completed the entire curriculum! 🎉", cls: "text-emerald-400" };
    }
    return null;
  };

  const msg = transitionMsg();

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Result */}
      <div className="flex flex-col items-center py-3 gap-2">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl border-2 ${
            isCorrect
              ? "bg-emerald-900/40 border-emerald-500 text-emerald-400"
              : "bg-rose-900/40 border-rose-500 text-rose-400"
          }`}
        >
          {isCorrect ? "✓" : "✗"}
        </div>
        <h3 className={`text-xl font-bold ${isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
          {isCorrect ? "Correct!" : "Not quite"}
        </h3>
      </div>

      {/* Answer block */}
      <div className="bg-[#0f1117] border border-gray-800 rounded-xl px-4 py-3 space-y-2">
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Your answer</p>
          <p className={`text-sm font-medium ${isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
            {userAnswer}
          </p>
        </div>
        {!isCorrect && correctAnswer && (
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Correct answer</p>
            <p className="text-sm font-medium text-emerald-400">{correctAnswer}</p>
          </div>
        )}
      </div>

      {/* AI feedback */}
      <div className="bg-[#0f1117] border-l-4 border-blue-600 rounded-xl px-4 py-3">
        <p className="text-xs text-blue-500 uppercase tracking-widest mb-1">⚡ AI Feedback</p>
        <p className="text-gray-300 text-sm leading-relaxed">{feedback}</p>
      </div>

      {/* Transition message */}
      {msg && (
        <p className={`text-xs font-medium text-center ${msg.cls}`}>{msg.text}</p>
      )}

      {/* CTA */}
      {!isReadOnly && nextAction !== "curriculum_complete" && (
        <button
          onClick={onNext}
          className="w-full py-3 rounded-xl border border-gray-600 text-white font-medium hover:bg-white hover:text-black transition-all text-sm"
        >
          {nextAction === "advance" ? "Next concept →" : "Next question →"}
        </button>
      )}
    </div>
  );
}

export default FeedbackCard;
