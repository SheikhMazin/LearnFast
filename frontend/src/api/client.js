const baseURL = "http://127.0.0.1:5000";

export async function getLanguages() {
  const response = await fetch(`${baseURL}/languages`);
  const data = await response.json();
  return data;
}

export async function startSession(topic, language) {
  const response = await fetch(`${baseURL}/session/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, language }),
  });
  return await response.json();
}

export async function getLesson(topic, language) {
  const response = await fetch(`${baseURL}/lesson`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, language }),
  });
  return await response.json();
}

export async function getChallenge(topic, language) {
  const response = await fetch(`${baseURL}/challenge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, language }),
  });
  return await response.json();
}

export async function submitAnswer(answer) {
  const response = await fetch(`${baseURL}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answer),
  });
  return await response.json();
}
