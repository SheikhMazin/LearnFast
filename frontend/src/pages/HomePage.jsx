import { SUPPORTED_LANGUAGES } from "../constants/languages";
import Header from "../components/Header";
import { useState } from "react";

function HomePage({
  selectedLanguage,
  changeLanguage,
  streak,
  difficulty,
  sessionId,
  beginSession,
  user,
  logout,
  onHistory,
  onHome,
}) {
  const [topic, setTopic] = useState("");
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        selectedLanguage={selectedLanguage}
        onChange={changeLanguage}
        user={user}
        logout={logout}
        onHistory={onHistory}
        onHome={onHome}
      />
      {/* Hero */}
      <div className="max-w-xl mx-auto px-6 pt-12 pb-6 text-center">
        <h1 className="text-3xl font-medium text-gray-900 mb-3">
          Learn anything, in any language
        </h1>
        <p className="text-gray-500 text-base">
          Pick a topic, choose your language, and start learning with AI-powered
          lessons.
        </p>
      </div>

      <div className="max-w-xl mx-auto px-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-medium text-gray-900">{streak}</p>
            <p className="text-xs text-gray-400 mt-1">Streak</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-medium text-gray-900">
              {difficulty ?? "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Difficulty</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-medium text-gray-900">
              {sessionId ?? "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Session</p>
          </div>
        </div>

        {/* Topic input */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 mb-3">
            What do you want to learn?
          </p>
          <div className="flex gap-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              type="text"
              placeholder="e.g. fractions, photosynthesis, WW2..."
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={(e) => beginSession(topic, selectedLanguage)}
              className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white font-medium whitespace-nowrap"
            >
              Start lesson
            </button>
          </div>
        </div>

        {/* Language picker */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 mb-3">Choose your language</p>
          <div className="grid grid-cols-4 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.name}
                onClick={() => changeLanguage(lang.name)}
                className={`py-2 px-1 rounded-lg text-sm border transition-all text-center ${
                  selectedLanguage.name === lang.name
                    ? "border-blue-400 bg-blue-50 text-blue-800"
                    : "border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-300"
                }`}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
