const baseURL = "http://127.0.0.1:5000";

export async function getLanguages() {
  const response = await fetch(`${baseURL}/languages`);
  const data = await response.json();
  return data;
}

export async function startSession(topic, language) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${baseURL}/session/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topic, language }),
  });
  return await response.json();
}

export async function getLesson(sessionId, topic, language) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${baseURL}/lesson`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ session_id: sessionId, topic, language }),
  });
  return await response.json();
}

export async function getChallenge(sessionId, topic, language, lessonContext) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${baseURL}/challenge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      session_id: sessionId,
      topic,
      language,
      lesson_context: lessonContext,
    }),
  });
  return await response.json();
}

export async function submitAnswer(answer) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${baseURL}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(answer),
  });
  return await response.json();
}

export async function getHistory(session_id) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${baseURL}/session/${session_id}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data;
}
