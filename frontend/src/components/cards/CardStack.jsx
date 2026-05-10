import { ArrowLeftIcon, ArrowRightIcon, ChatIcon } from "../Icons";
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
  onBack, onForward, onAnswer, onAskQuestion,
  stats,
}) {
  const currentCard = cards[cardIdx] || null;
  const hasHistory = cardIdx > 0;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* History banner */}
      {isInHistory && (
        <div
          className="mb-3 px-4 py-1.5 text-xs"
          style={{
            borderRadius: "20px",
            border: "1px solid var(--warning)",
            background: "var(--warning-bg)",
            color: "var(--warning)",
          }}
        >
          Viewing previous card — navigate forward to resume
        </div>
      )}

      {/* Position indicator */}
      {cards.length > 0 && (
        <p className="text-xs mb-3" style={{ color: "var(--text-dim)" }}>
          {cardIdx + 1} / {cards.length}
        </p>
      )}

      {/* Stack */}
      <div className="relative w-full" style={{ paddingBottom: "14px", paddingRight: "14px" }}>
        {hasHistory && (
          <>
            <div
              className="absolute inset-0 notebook-ghost"
              style={{ transform: "translateY(10px) translateX(10px)", opacity: 0.3 }}
            />
            <div
              className="absolute inset-0 notebook-ghost"
              style={{ transform: "translateY(5px) translateX(5px)", opacity: 0.55 }}
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
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ border: "1.5px solid var(--border-light)", color: "var(--text-muted)" }}
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>

        <div className="flex gap-1.5">
          {cards.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === cardIdx ? "16px" : "6px",
                height: "6px",
                background: i === cardIdx ? "var(--green)" : "var(--border-light)",
              }}
            />
          ))}
        </div>

        <button
          onClick={onForward}
          disabled={!canGoForward || (currentCard?.type === "question" && !isInHistory)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ border: "1.5px solid var(--border-light)", color: "var(--text-muted)" }}
        >
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Ask a question */}
      {onAskQuestion && (
        <button
          onClick={onAskQuestion}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border-light)",
            borderRadius: "6px 14px 10px 6px / 8px 6px 14px 8px",
            color: "var(--text-muted)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--card)";
            e.currentTarget.style.color = "var(--green)";
            e.currentTarget.style.borderColor = "var(--green)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.borderColor = "var(--border-light)";
          }}
        >
          <ChatIcon className="w-4 h-4" />
          Confused? Ask a question
        </button>
      )}

      {/* Loading indicator */}
      {isLoading && currentCard && (
        <p className="text-xs mt-3 flex items-center gap-2" style={{ color: "var(--text-dim)" }}>
          <span
            className="w-3 h-3 rounded-full border-2 border-transparent animate-spin inline-block"
            style={{ borderTopColor: "var(--green)" }}
          />
          Loading next card...
        </p>
      )}
    </div>
  );
}

export default CardStack;
