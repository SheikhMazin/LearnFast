import { useState } from "react";
import { useLanguage } from "./hooks/useLanguage";
import { useSession } from "./hooks/useSession";
import { getDirection } from "./utils/direction";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  const [page, setPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { selectedLanguage, changeLanguage } = useLanguage();
  const { sessionId, difficulty, streak } = useSession();
  const direction = getDirection(selectedLanguage);

  if (!isLoggedIn) {
    if (page === "signup") {
      return (
        <SignUpPage
          onSignUp={() => setIsLoggedIn(true)}
          onGoToLogin={() => setPage("login")}
        />
      );
    }
    return (
      <LoginPage
        onLogin={() => setIsLoggedIn(true)}
        onGoToSignUp={() => setPage("signup")}
      />
    );
  }

  return (
    <div dir={direction}>
      <HomePage
        selectedLanguage={selectedLanguage}
        changeLanguage={changeLanguage}
        streak={streak}
        difficulty={difficulty}
        sessionId={sessionId}
      />
    </div>
  );
}

export default App;