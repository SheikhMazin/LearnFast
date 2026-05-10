const BASE = import.meta.env.VITE_API_URL;

function headers() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: headers() });
  return res.json();
}

export function parseChallenge(data) {
  if (!data || data.error) return null;
  const key = Object.keys(data).find((k) => k !== "error");
  if (!key) return null;
  const q = data[key];
  if (!q) return null;
  const question_type = (q.type || key).toLowerCase().replace(/\s+/g, "_");
  return { ...q, question_type };
}

export const api = {
  startSession: (topic, language, difficulty = 2) =>
    post("/session/start", { topic, language, difficulty }),

  getLesson: (sessionId) =>
    post("/lesson", { session_id: sessionId }),

  getChallenge: (sessionId, lessonContext = "") =>
    post("/challenge", { session_id: sessionId, lesson_context: lessonContext }),

  submitAnswer: (sessionId, userAnswer, correctAnswer, questionType, timeTaken = 15) =>
    post("/answer", {
      session_id: sessionId,
      user_answer: userAnswer,
      correct_answer: correctAnswer,
      question_type: questionType,
      time_taken_seconds: timeTaken,
    }),

  getFlashcard: (sessionId) =>
    post("/flashcard", { session_id: sessionId }),

  ask: (sessionId, question) =>
    post("/ask", { session_id: sessionId, question }),

  getCurriculum: (sessionId) =>
    get(`/curriculum/${sessionId}`),

  getStats: (sessionId) =>
    get(`/session/${sessionId}/stats`),

  resetSession: (sessionId) =>
    post(`/session/${sessionId}/reset`, {}),

  listSessions: () => get("/sessions"),
};
