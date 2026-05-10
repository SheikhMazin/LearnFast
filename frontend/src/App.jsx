import { useLanguage } from "./hooks/useLanguage";
import { useSession } from "./hooks/useSession";
import { getDirection } from "./utils/direction";
import HomePage from "./pages/HomePage";

function App() {
  const { selectedLanguage, changeLanguage } = useLanguage();
  const { sessionId, difficulty, streak, beginSession } = useSession();
  const direction = getDirection(selectedLanguage);

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
