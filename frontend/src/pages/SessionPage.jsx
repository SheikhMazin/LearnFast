import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api, parseChallenge } from "../api/client";
import { FlameIcon } from "../components/Icons";
import CardStack from "../components/cards/CardStack";
import CurriculumMap from "../components/CurriculumMap";
import HistoryPanel from "../components/HistoryPanel";
import QADrawer from "../components/QADrawer";

function SessionPage({ session, onComplete, onHome, onStart, logout }) {
  const { t } = useTranslation();
  const { sessionId, topic, language } = session;

  const [cards, setCards] = useState([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [curriculum, setCurriculum] = useState(session.curriculum || []);
  const [stats, setStats] = useState({
    streak: 0,
    accuracy: 0,
    difficulty: session.difficulty || 2,
    questionsAnswered: 0,
    totalCorrect: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [qaOpen, setQaOpen] = useState(false);
  const [qaThread, setQaThread] = useState([]);
  const lessonContextRef = useRef("");

  const pushCard = useCallback((card) => {
    setCards((prev) => [...prev, card]);
    setCardIdx((prev) => prev + 1);
  }, []);

  const syncCurriculum = useCallback((nextAction, nodeContext) => {
    if (!nodeContext) return;
    setCurriculum((prev) =>
      prev.map((node) => {
        if (nextAction === "advance") {
          // backend increments current_node before building context:
          // completed = current_node - 1, newly active = current_node
          if (node.id === nodeContext.current_node - 1) return { ...node, status: "complete" };
          if (node.id === nodeContext.current_node) return { ...node, status: "in_progress" };
        } else if (nextAction === "curriculum_complete") {
          if (node.id === nodeContext.current_node) return { ...node, status: "complete" };
        } else if (nextAction === "rollback") {
          if (node.id === nodeContext.current_node) return { ...node, status: "in_progress" };
        }
        return node;
      })
    );
  }, []);

  const fetchFlashcard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getFlashcard(sessionId);
      if (!data.error) pushCard({ type: "flashcard", data });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, pushCard]);

  const fetchLesson = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getLesson(sessionId);
      if (!data.error) {
        lessonContextRef.current = data.lesson || "";
        pushCard({ type: "lesson", data });
      }
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, pushCard]);

  const fetchChallenge = useCallback(async () => {
    setIsLoading(true);
    try {
      const raw = await api.getChallenge(sessionId, lessonContextRef.current);
      const parsed = parseChallenge(raw);
      if (parsed) pushCard({ type: "question", data: parsed });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, pushCard]);

  const handleAnswer = useCallback(
    async (userAnswer, correctAnswer, questionType, startTime) => {
      const timeTaken = startTime ? (Date.now() - startTime) / 1000 : 15;
      setIsLoading(true);
      try {
        const result = await api.submitAnswer(
          sessionId,
          userAnswer,
          correctAnswer,
          questionType,
          timeTaken
        );

        if (result.session) {
          const s = result.session;
          setStats({
            streak: s.current_streak || 0,
            accuracy: s.accuracy || 0,
            difficulty: s.current_difficulty || 2,
            questionsAnswered: s.questions_answered || 0,
            totalCorrect: s.total_correct || 0,
          });
        }

        syncCurriculum(result.next_action, result.node_context);

        pushCard({
          type: "feedback",
          data: {
            isCorrect: result.is_correct,
            feedback: result.feedback,
            userAnswer,
            correctAnswer,
            nextAction: result.next_action,
            nodeContext: result.node_context,
            session: result.session,
          },
        });

        if (result.next_action === "curriculum_complete") {
          setTimeout(() => onComplete(result.session), 2500);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, pushCard, syncCurriculum, onComplete]
  );

  const handleAdvance = useCallback(async () => {
    if (isLoading) return;

    if (cardIdx < cards.length - 1) {
      setCardIdx((i) => i + 1);
      return;
    }

    const currentCard = cards[cardIdx];
    if (!currentCard) return;

    if (currentCard.type === "flashcard") {
      await fetchLesson();
    } else if (currentCard.type === "lesson") {
      await fetchChallenge();
    } else if (currentCard.type === "feedback") {
      const { nextAction } = currentCard.data;
      if (nextAction === "advance") {
        await fetchFlashcard();
      } else if (nextAction === "re_explore") {
        await fetchChallenge();
      } else if (nextAction === "rollback") {
        await fetchLesson();
      } else if (nextAction === "curriculum_complete") {
        onComplete(currentCard.data.session);
      }
    }
  }, [cards, cardIdx, isLoading, fetchFlashcard, fetchLesson, fetchChallenge, onComplete]);

  const handleBack = useCallback(() => {
    setCardIdx((i) => Math.max(0, i - 1));
  }, []);

  const handleAsk = useCallback(
    async (question) => {
      const result = await api.ask(sessionId, question);
      if (!result.error) {
        setQaThread((prev) => [
          ...prev,
          { question, answer: result.answer, concept: result.concept_context },
        ]);
      }
    },
    [sessionId]
  );

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const [fc, lesson] = await Promise.all([
          api.getFlashcard(sessionId),
          api.getLesson(sessionId),
        ]);
        const initial = [];
        if (fc && !fc.error) initial.push({ type: "flashcard", data: fc });
        if (lesson && !lesson.error) {
          lessonContextRef.current = lesson.lesson || "";
          initial.push({ type: "lesson", data: lesson });
        }
        if (initial.length > 0) {
          setCards(initial);
          setCardIdx(0);
        }
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [sessionId]);

  useEffect(() => {
    const onKey = (e) => {
      if (qaOpen) return;
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "Enter") handleAdvance();
      if (e.key === "ArrowLeft") handleBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleAdvance, handleBack, qaOpen]);

  const currentCard = cards[cardIdx] || null;
  const isInHistory = cardIdx < cards.length - 1;
  const canGoBack = cardIdx > 0;
  const canGoForward =
    cardIdx < cards.length - 1 ||
    (currentCard && currentCard.type !== "question" && !isLoading);

  return (
    <div className="h-screen overflow-hidden flex" style={{ background: "var(--bg)" }}>
      <HistoryPanel onResume={onStart} onHome={onHome} />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* HUD */}
        <header
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-5 text-sm">
            <span className="flex items-center gap-1 font-medium" style={{ color: "var(--warning)" }}>
              <FlameIcon className="w-3.5 h-3.5" />
              {stats.streak}
            </span>
            <span style={{ color: "var(--text-muted)" }}>
              {Math.round((stats.accuracy || 0) * 100)}{t("hud.accuracy")}
            </span>
            <span style={{ color: "var(--green-light)" }}>
              {t(`hud.difficulty.${stats.difficulty}`, { defaultValue: `Lvl ${stats.difficulty}` })}
            </span>
            <button
              onClick={logout}
              className="transition-colors"
              style={{ color: "var(--text-dim)" }}
              onMouseEnter={(e) => e.target.style.color = "var(--text-muted)"}
              onMouseLeave={(e) => e.target.style.color = "var(--text-dim)"}
            >
              {t("hud.logout")}
            </button>
          </div>
        </header>

        {/* Card area */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col items-center p-6">
          {isLoading && cards.length === 0 ? (
            <div className="my-auto flex flex-col items-center gap-4" style={{ color: "var(--text-muted)" }}>
              <div
                className="w-10 h-10 rounded-full border-4 border-transparent animate-spin"
                style={{ borderTopColor: "var(--green-light)" }}
              />
              <p className="text-sm">{t("cards.loading")}</p>
            </div>
          ) : (
            <div className="my-auto w-full">
              <CardStack
                cards={cards}
                cardIdx={cardIdx}
                isInHistory={isInHistory}
                isLoading={isLoading}
                canGoBack={canGoBack}
                canGoForward={canGoForward}
                onBack={handleBack}
                onForward={handleAdvance}
                onAnswer={handleAnswer}
                onAskQuestion={() => setQaOpen(true)}
                stats={stats}
              />
            </div>
          )}
        </div>
      </div>

      <CurriculumMap curriculum={curriculum} topic={topic} />

      {qaOpen && (
        <QADrawer
          thread={qaThread}
          topic={topic}
          onAsk={handleAsk}
          onClose={() => setQaOpen(false)}
        />
      )}
    </div>
  );
}

export default SessionPage;
