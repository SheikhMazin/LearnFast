import { useState } from "react";
import { SUPPORTED_LANGUAGES } from "../constants/languages";

export function useLanguage() {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const saved = localStorage.getItem("selectedLanguage");
    if (saved) {
      const found = SUPPORTED_LANGUAGES.find((l) => l.name === saved);
      if (found) return found;
    }
    return SUPPORTED_LANGUAGES[0];
  });

  const changeLanguage = (languageName) => {
    const found = SUPPORTED_LANGUAGES.find((l) => l.name === languageName);
    if (found) {
      setSelectedLanguage(found);
      localStorage.setItem("selectedLanguage", found.name);
    }
  };

  return { selectedLanguage, changeLanguage };
}