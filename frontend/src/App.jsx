import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useLanguage } from "./hooks/useLanguage";
import { getDirection } from "./utils/direction";
import { api } from "./api/client";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import LoadingPage from "./pages/LoadingPage";
import SessionPage from "./pages/SessionPage";
import CompletionPage from "./pages/CompletionPage";

function App() {
  const { user, login, signup, logout } = useAuth();
  const { selectedLanguage, changeLanguage } = useLanguage();
  const [authPage, setAuthPage] = useState("login");
  const [page, setPage] = useState("home");
  const [session, setSession] = useState(null);
  const [pendingTopic, setPendingTopic] = useState("");
  const [completionStats, setCompletionStats] = useState(null);

  const direction = getDirection(selectedLanguage);

  const handleStart = async (topic) => {
    setPendingTopic(topic);
    setPage("loading");
    try {
      const data = await api.startSession(topic, selectedLanguage.name, 2);
      if (data.session_id) {
        setSession({
          sessionId: data.session_id,
          topic,
          language: selectedLanguage.name,
          curriculum: data.curriculum || [],
          currentNode: data.current_node || 0,
          difficulty: data.current_difficulty || 2,
        });
        setPage("session");
      } else {
        setPage("home");
      }
    } catch {
      setPage("home");
    }
  };

  const handleComplete = (stats) => {
    setCompletionStats(stats);
    setPage("complete");
  };

  const handleReset = () => {
    setSession(null);
    setCompletionStats(null);
    setPage("home");
  };

  if (!user) {
    if (authPage === "signup") {
      return (
        <SignUpPage
          onSignUp={async (email, password) => {
            const ok = await signup(email, password);
            if (ok) setAuthPage("login");
            return ok;
          }}
          onGoToLogin={() => setAuthPage("login")}
        />
      );
    }
    return <LoginPage onLogin={login} onGoToSignUp={() => setAuthPage("signup")} />;
  }

  return (
    <div dir={direction}>
      {page === "home" && (
        <HomePage
          selectedLanguage={selectedLanguage}
          changeLanguage={changeLanguage}
          onStart={handleStart}
          user={user}
          logout={logout}
        />
      )}
      {page === "loading" && <LoadingPage topic={pendingTopic} />}
      {page === "session" && session && (
        <SessionPage
          session={session}
          onComplete={handleComplete}
          onHome={handleReset}
          user={user}
          logout={logout}
        />
      )}
      {page === "complete" && (
        <CompletionPage stats={completionStats} onNewTopic={handleReset} />
      )}
    </div>
  );
}

export default App;
