import { useState } from "react";
import { useLanguage } from "./hooks/useLanguage";
import { useSession } from "./hooks/useSession";
import { useAuth } from "./hooks/useAuth";
import { getDirection } from "./utils/direction";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  const [page, setPage] = useState("login");
  const { user, login, signup } = useAuth();
  const { selectedLanguage, changeLanguage } = useLanguage();
  const { sessionId, difficulty, streak, beginSession } = useSession();
  const direction = getDirection(selectedLanguage);

  const handleLogin = async (email, password) => {
    const success = await login(email, password);
    if (success) setPage("home");
    return success;
  };

  const handleSignUp = async (email, password) => {
    const success = await signup(email, password);
    if (success) setPage("login");
    return success;
  };

  if (!user) {
    if (page === "signup") {
      return <SignUpPage onSignUp={handleSignUp} onGoToLogin={() => setPage("login")} />;
    }
    return <LoginPage onLogin={handleLogin} onGoToSignUp={() => setPage("signup")} />;
  }

  return (
    <div dir={direction}>
      <HomePage
        selectedLanguage={selectedLanguage}
        changeLanguage={changeLanguage}
        streak={streak}
        difficulty={difficulty}
        sessionId={sessionId}
        beginSession={beginSession}
      />
    </div>
  );
}

export default App;
