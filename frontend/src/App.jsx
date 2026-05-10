import { useState } from "react";
import { useLanguage } from "./hooks/useLanguage";
import { useAuth } from "./hooks/useAuth";
import { getDirection } from "./utils/direction";
import HomePage from "./pages/HomePage";
import LessonPage from "./pages/LessonPage";
import ChallengePage from "./pages/ChallengePage";
import FeedbackPage from "./pages/FeedbackPage";
import StatsPage from "./pages/StatsPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  const { user, login, signup } = useAuth();
  const { selectedLanguage, changeLanguage } = useLanguage();
  const [authPage, setAuthPage] = useState("login");
  const [page, setPage] = useState("home");

  const [topic, setTopic] = useState("");
  const [lessonText, setLessonText] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [questionNum, setQuestionNum] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [difficulty, setDifficulty] = useState("Beginner");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [avgTime, setAvgTime] = useState(0);

  const token = localStorage.getItem("access_token");

  const handleLogin = async (email, password) => {
    const success = await login(email, password);
    return success;
  };

  const handleSignUp = async (email, password) => {
    const success = await signup(email, password);
    if (success) setAuthPage("login");
    return success;
  };

  const handleStart = async (topicInput, language) => {
    setTopic(topicInput);
    // Start session
    const sessionRes = await fetch("http://localhost:5000/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ topic: topicInput, language, difficulty: 1 }),
    });
    const sessionData = await sessionRes.json();
    setSessionId(sessionData.session_id);
    setDifficulty("Beginner");

    // Get lesson
    const lessonRes = await fetch("http://localhost:5000/lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ topic: topicInput, language, session_id: sessionData.session_id }),
    });
    const lessonData = await lessonRes.json();
    setLessonText(lessonData.lesson);
    setPage("lesson");
  };

  const handleReady = async () => {
    const res = await fetch("http://localhost:5000/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ topic, language: selectedLanguage.name, session_id: sessionId, lesson_context: lessonText }),
    });
    const data = await res.json();
    setQuestion(data.question);
    setOptions(data.options);
    setCorrectAnswer(data.correct_answer);
    setPage("challenge");
  };

  const handleSubmit = async (answer) => {
    setUserAnswer(answer);
    const res = await fetch("http://localhost:5000/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({
        session_id: sessionId,
        user_answer: answer,
        correct_answer: correctAnswer,
        question_type: "multiple_choice",
        time_taken_seconds: 8,
      }),
    });
    const data = await res.json();
    setIsCorrect(data.is_correct);
    setFeedback(data.feedback);
    if (data.is_correct) setStreak(s => s + 1);
    else setStreak(0);
    setQuestionsAnswered(q => q + 1);
    setCorrect(c => data.is_correct ? c + 1 : c);
    setPage("feedback");
  };

  const handleNext = () => {
    if (questionNum >= 10) {
      setAccuracy(Math.round((correct / questionsAnswered) * 100));
      setAvgTime(8.2);
      setPage("stats");
    } else {
      setQuestionNum(q => q + 1);
      handleReady();
    }
  };

  const handleReset = () => {
    setPage("home");
    setQuestionNum(1);
    setStreak(0);
    setCorrect(0);
    setQuestionsAnswered(0);
  };

  const direction = getDirection(selectedLanguage);

  if (!user) {
    if (authPage === "signup") {
      return <SignUpPage onSignUp={handleSignUp} onGoToLogin={() => setAuthPage("login")} />;
    }
    return <LoginPage onLogin={handleLogin} onGoToSignUp={() => setAuthPage("signup")} />;
  }

  return (
    <div dir={direction}>
      {page === "home" && (
        <HomePage selectedLanguage={selectedLanguage} changeLanguage={changeLanguage} onStart={handleStart} />
      )}
      {page === "lesson" && (
        <LessonPage topic={topic} language={selectedLanguage.name} difficulty={difficulty}
          lessonText={lessonText} questionNum={questionNum} totalQuestions={10}
          streak={streak} onReady={handleReady} />
      )}
      {page === "challenge" && (
        <ChallengePage topic={topic} language={selectedLanguage.name} difficulty={difficulty}
          streak={streak} question={question} options={options}
          questionNum={questionNum} totalQuestions={10} onSubmit={handleSubmit} />
      )}
      {page === "feedback" && (
        <FeedbackPage isCorrect={isCorrect} userAnswer={userAnswer}
          feedback={feedback} onNext={handleNext} onReviewLesson={() => setPage("lesson")} />
      )}
      {page === "stats" && (
        <StatsPage topic={topic} language={selectedLanguage.name} questionsAnswered={questionsAnswered}
          correct={correct} streak={streak} accuracy={accuracy} avgTime={avgTime}
          difficulty={difficulty} onKeepGoing={handleReady} onReset={handleReset} />
      )}
    </div>
  );
}

export default App;