export async function getlanguages() {
  const response = await fetch("http://localhost:5000/languages");
  const data = await response.json();
  return data;
}

export async function startSession(topic, language) {
  const response = await fetch("http://localhost:5000/session/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topic, language }),
  });
  const sessionData = await response.json();
  return sessionData;
}

export async function getLesson(topic, language) {
  const response = await fetch("http://localhost:5000/lesson", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topic, language }),
  });
  const lessonData = await response.json();
  return lessonData;
}

export async function getChallenge(topic, language) {
  const response = await fetch("http://localhost:5000/challenge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topic, language }),
  });
  const challengeData = await response.json();
  return challengeData;
}

export async function submitAnswer(answer) {
  const response = await fetch("http://localhost:5000/answer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(answer),
  });
  const answerData = await response.json();
  return answerData;
}
