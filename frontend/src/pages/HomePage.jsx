import { useState } from "react";
import { SUPPORTED_LANGUAGES } from "../constants/languages";
import Header from "../components/Header";

const LANG_CODES = {
  English: "GB",
  Spanish: "ES",
  French: "FR",
  Mandarin: "CN",
  Arabic: "SA",
  Hindi: "IN",
  Portuguese: "BR",
  Swahili: "KE",
};

function HomePage({
  selectedLanguage,
  changeLanguage,
  streak,
  difficulty,
  sessionId,
  onStart,
  user,
  logout,
  onHistory,
  onHome,
}) {
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");

  const handleStart = () => {
    if (!topic.trim()) {
      setError("Please enter a topic first");
      return;
    }
    setError("");
    onStart(topic, selectedLanguage.name);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex flex-col">
      <Header
        user={user}
        logout={logout}
        onHistory={onHistory}
        onHome={onHome}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-12">
        <h1 className="text-4xl font-bold mb-3 leading-tight">
          What do you want
          <br />
          to learn today?
        </h1>
        <p className="text-gray-400 text-base mb-10">
          AI-generated lessons in your language, adapting to your level in real
          time.
        </p>

        <div className="w-full max-w-lg mb-6">
          <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block text-left">
            Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setError("");
            }}
            placeholder="e.g. Photosynthesis, World War II, Basic Algebra..."
            className="w-full bg-[#1c1f2e] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          {error && (
            <p className="text-red-400 text-xs mt-1 text-left">{error}</p>
          )}
        </div>

        <div className="w-full max-w-lg mb-8">
          <label className="text-xs text-gray-400 uppercase tracking-widest mb-3 block text-left">
            Language
          </label>
          <div className="grid grid-cols-4 gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.name}
                onClick={() => changeLanguage(lang.name)}
                className={`py-3 px-2 rounded-xl border text-center transition-all ${
                  selectedLanguage.name === lang.name
                    ? "border-blue-500 bg-blue-600/20 text-white"
                    : "border-gray-700 bg-[#1c1f2e] text-gray-300 hover:border-gray-500"
                }`}
              >
                <div className="font-bold text-sm">{LANG_CODES[lang.name]}</div>
                <div className="text-xs text-gray-400 mt-0.5">{lang.name}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full max-w-lg py-3.5 rounded-xl border border-gray-600 text-white font-semibold text-base hover:bg-white hover:text-black transition-all"
        >
          Start Learning →
        </button>
      </div>
    </div>
  );
}

export default HomePage;
