import CardFrame from "./CardFrame";
import LessonCard from "./LessonCard";
import FlashCard from "./FlashCard";
import FeedbackCard from "./FeedbackCard";
import QuestionCard from "./QuestionCard";

function CardContent({ card, onForward, onAnswer, stats, isReadOnly }) {
  if (!card) return null;
  switch (card.type) {
    case "flashcard":
      return <FlashCard data={card.data} onReady={onForward} isReadOnly={isReadOnly} />;
    case "lesson":
      return <LessonCard data={card.data} onReady={onForward} stats={stats} isReadOnly={isReadOnly} />;
    case "question":
      return <QuestionCard data={card.data} onAnswer={onAnswer} stats={stats} isReadOnly={isReadOnly} />;
    case "feedback":
      return <FeedbackCard data={card.data} onNext={onForward} isReadOnly={isReadOnly} />;
    default:
      return null;
  }
}

function CardStack({
  cards, cardIdx, isInHistory, isLoading,
  canGoBack, canGoForward,
  onBack, onForward, onAnswer,
  stats,
}) {
  const currentCard = cards[cardIdx] || null;
  const hasHistory = cardIdx > 0;

  return (
    <div className="w-full max-w-lg flex flex-col items-center">
      {/* History banner */}
      {isInHistory && (
        <div className="mb-3 px-4 py-1.5 rounded-full border border-amber-700/50 bg-amber-900/20 text-amber-400 text-xs">
          Viewing previous card — navigate forward to resume
        </div>
      )}

      {/* Position indicator */}
      {cards.length > 0 && (
        <p className="text-xs text-gray-700 mb-3">
          {cardIdx + 1} / {cards.length}
        </p>
      )}

      {/* Stack */}
      <div className="relative w-full" style={{ paddingBottom: "14px", paddingRight: "14px" }}>
        {hasHistory && (
          <>
            <div
              className="absolute inset-0 rounded-2xl bg-[#1c1f2e] border border-gray-800"
              style={{ transform: "translateY(10px) translateX(10px)", opacity: 0.25 }}
            />
            <div
              className="absolute inset-0 rounded-2xl bg-[#1c1f2e] border border-gray-800"
              style={{ transform: "translateY(5px) translateX(5px)", opacity: 0.5 }}
            />
          </>
        )}

        <div key={cardIdx} className="card-enter relative">
          <CardFrame isLoading={isLoading && !currentCard}>
            <CardContent
              card={currentCard}
              onForward={onForward}
              onAnswer={onAnswer}
              stats={stats}
              isReadOnly={isInHistory}
            />
          </CardFrame>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center justify-between w-full mt-5 px-1">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="w-10 h-10 rounded-full border border-gray-800 text-gray-600 flex items-center justify-center hover:border-gray-600 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed text-lg"
        >
          ←
        </button>

        <div className="flex gap-1.5">
          {cards.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === cardIdx ? "w-4 h-1.5 bg-blue-500" : "w-1.5 h-1.5 bg-gray-700"
              }`}
            />
          ))}
        </div>

        <button
          onClick={onForward}
          disabled={!canGoForward || (currentCard?.type === "question" && !isInHistory)}
          className="w-10 h-10 rounded-full border border-gray-800 text-gray-600 flex items-center justify-center hover:border-gray-600 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed text-lg"
        >
          →
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && currentCard && (
        <p className="text-xs text-gray-600 mt-3 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-gray-700 border-t-blue-500 animate-spin inline-block" />
          Loading next card...
        </p>
      )}
    </div>
  );
}

export default CardStack;
