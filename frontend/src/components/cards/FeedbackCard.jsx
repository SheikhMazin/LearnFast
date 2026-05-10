import { useTranslation } from "react-i18next";
import { CheckIcon, XIcon, BoltIcon } from "../Icons";

function FeedbackCard({ data, onNext, isReadOnly }) {
  const { t } = useTranslation();
  const { isCorrect, feedback, userAnswer, correctAnswer, nextAction, nodeContext } = data;

  const transitionMsg = () => {
    if (nextAction === "advance") {
      const next = nodeContext?.concept || nodeContext?.next_concept;
      return next
        ? { text: t("feedback.movingOn", { concept: next }), color: "var(--success)" }
        : { text: t("feedback.greatNext"), color: "var(--success)" };
    }
    if (nextAction === "rollback") {
      const to = nodeContext?.rollback_to;
      return to
        ? { text: t("feedback.revisit", { concept: to }), color: "var(--warning)" }
        : { text: t("feedback.stepBack"), color: "var(--warning)" };
    }
    if (nextAction === "curriculum_complete") {
      return { text: t("feedback.curriculumDone"), color: "var(--success)" };
    }
    return null;
  };

  const msg = transitionMsg();

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex flex-col items-center py-3 gap-2">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center border-2"
          style={
            isCorrect
              ? { background: "#e0f0dc", borderColor: "var(--success)", color: "var(--success)" }
              : { background: "#f0dede", borderColor: "var(--error)", color: "var(--error)" }
          }
        >
          {isCorrect ? <CheckIcon className="w-7 h-7" /> : <XIcon className="w-7 h-7" />}
        </div>
        <h3
          className="text-xl font-bold font-title"
          style={{ color: isCorrect ? "var(--success)" : "var(--error)" }}
        >
          {isCorrect ? t("feedback.correct") : t("feedback.incorrect")}
        </h3>
      </div>

      <div
        className="px-4 py-3 space-y-2"
        style={{
          background: "var(--card-2)",
          border: "1px solid var(--card-line)",
          borderRadius: "3px 8px 6px 3px / 4px 3px 8px 4px",
        }}
      >
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--ink-muted)" }}>{t("feedback.yourAnswer")}</p>
          <p className="text-sm font-medium" style={{ color: isCorrect ? "var(--success)" : "var(--error)" }}>
            {userAnswer}
          </p>
        </div>
        {!isCorrect && correctAnswer && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--ink-muted)" }}>{t("feedback.correctAnswer")}</p>
            <p className="text-sm font-medium" style={{ color: "var(--success)" }}>{correctAnswer}</p>
          </div>
        )}
      </div>

      <div
        className="px-4 py-3"
        style={{
          background: "var(--card-2)",
          borderLeft: "3px solid var(--green)",
          borderRadius: "2px 8px 6px 2px / 3px 2px 8px 3px",
        }}
      >
        <p className="text-xs uppercase tracking-widest mb-1 flex items-center gap-1" style={{ color: "var(--green)" }}>
          <BoltIcon className="w-3 h-3" />
          {t("feedback.aiFeedback")}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>{feedback}</p>
      </div>

      {msg && (
        <p className="text-xs font-medium text-center" style={{ color: msg.color }}>{msg.text}</p>
      )}

      {!isReadOnly && nextAction !== "curriculum_complete" && (
        <button onClick={onNext} className="btn-outline w-full py-3 text-sm">
          {nextAction === "advance" ? t("feedback.nextConcept") : t("feedback.nextQuestion")}
        </button>
      )}
    </div>
  );
}

export default FeedbackCard;
