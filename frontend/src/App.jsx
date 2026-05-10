import { useLanguage } from "./hooks/useLanguage";
import { useSession } from "./hooks/useSession";
import { getDirection } from "./utils/direction";

function App() {
  const { selectedLanguage, changeLanguage } = useLanguage();
  const { sessionId, difficulty, streak, loading, error, beginSession, incrementStreak, resetStreak } = useSession();

  const direction = getDirection(selectedLanguage);

  return (
    <div dir={direction} className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">LearnFast</h1>

      {/* Language info */}
      <p>Selected Language: {selectedLanguage.flag} {selectedLanguage.name}</p>

      {/* Session info */}
      {sessionId && (
        <div className="mt-4">
          <p>Session ID: {sessionId}</p>
          <p>Difficulty: {difficulty}</p>
          <p>Streak: {streak}</p>
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading...</p>}
    </div>
  );
}

export default App;
