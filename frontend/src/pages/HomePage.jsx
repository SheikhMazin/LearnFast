import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../constants/languages";
import HistoryPanel from "../components/HistoryPanel";

const LANG_CODES = {
  English: "EN", Spanish: "ES", French: "FR", Mandarin: "中",
  Arabic: "ع", Hindi: "हि", Portuguese: "PT", Swahili: "SW",
};

function HomePage({ selectedLanguage, changeLanguage, onStart, logout }) {
  const { t } = useTranslation();
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");

  const handleStart = () => {
    if (!topic.trim()) { setError(t("home.topicError")); return; }
    setError("");
    onStart(topic.trim());
  };

  return (
    <div className="h-screen overflow-hidden flex" style={{ background: "var(--bg)" }}>
      <HistoryPanel onResume={onStart} />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="flex items-center justify-end px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <button
            onClick={logout}
            className="text-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => e.target.style.color = "var(--text)"}
            onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
          >
            {t("home.logout")}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 text-center pb-12">
          <h1 className="font-title text-5xl mb-3 leading-tight" style={{ color: "var(--text)" }}>
            {t("home.headline")}
          </h1>
          <p className="text-base mb-10" style={{ color: "var(--text-muted)" }}>
            {t("home.subtext")}
          </p>

          <div className="w-full max-w-lg mb-6">
            <label className="block text-xs uppercase tracking-widest mb-2 text-left" style={{ color: "var(--text-muted)" }}>
              {t("home.topicLabel")}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              placeholder={t("home.topicPlaceholder")}
              className="w-full px-4 py-3 text-sm rounded"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: error ? "1.5px solid var(--error)" : "1.5px solid var(--border-light)",
                color: "var(--text)",
                outline: "none",
              }}
              autoFocus
            />
            {error && <p className="text-xs mt-1.5 text-left" style={{ color: "var(--error)" }}>{error}</p>}
          </div>

          <div className="w-full max-w-lg mb-8">
            <label className="block text-xs uppercase tracking-widest mb-3 text-left" style={{ color: "var(--text-muted)" }}>
              {t("home.languageLabel")}
            </label>
            <div className="grid grid-cols-4 gap-3">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage.name === lang.name;
                return (
                  <button
                    key={lang.name}
                    onClick={() => changeLanguage(lang.name)}
                    className="py-3 px-2 text-center transition-all rounded"
                    style={{
                      background: isSelected ? "var(--card)" : "rgba(255,255,255,0.05)",
                      border: isSelected ? "1.5px solid var(--green)" : "1.5px solid var(--border-light)",
                      borderRadius: "4px 10px 8px 4px / 6px 4px 10px 6px",
                    }}
                  >
                    <div className="font-bold text-sm" style={{ color: isSelected ? "var(--green)" : "var(--text-muted)" }}>
                      {LANG_CODES[lang.name]}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: isSelected ? "var(--ink-muted)" : "var(--text-dim)" }}>
                      {lang.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="btn-primary w-full max-w-lg py-3.5 text-base font-semibold"
          >
            {t("home.startButton")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
