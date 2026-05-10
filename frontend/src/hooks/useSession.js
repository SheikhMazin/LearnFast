import { useState } from "react";
import { startSession } from "../api/client";

export function useSession() {
  const [sessionId, setSessionId] = useState(null);
  const [difficulty, setDifficulty] = useState("beginner");
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const beginSession = async (topic, language) => {
    setLoading(true);
    setError(null);
    try {
      const data = await startSession(topic, language);
      setSessionId(data.session_id);
      setDifficulty(data.difficulty || "beginner");
      setStreak(0);
    } catch (err) {
      setError("Failed to start session.");
    } finally {
      setLoading(false);
    }
  };

  const incrementStreak = () => setStreak((s) => s + 1);
  const resetStreak = () => setStreak(0);

  return {
    sessionId,
    difficulty,
    streak,
    loading,
    error,
    beginSession,
    incrementStreak,
    resetStreak,
  };
}