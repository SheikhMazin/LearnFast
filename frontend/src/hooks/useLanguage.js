import { useState } from "react";
import { SUPPORTED_LANGUAGES } from "../constants/languages";

export function useLanguage() {
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0]);

  const changeLanguage = (languageName) => {
    const found = SUPPORTED_LANGUAGES.find((l) => l.name === languageName);
    if (found) setSelectedLanguage(found);
  };

  return { selectedLanguage, changeLanguage };
}