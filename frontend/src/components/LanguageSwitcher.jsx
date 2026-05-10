import { SUPPORTED_LANGUAGES } from "../constants/languages";

function LanguageSwitcher({ selectedLanguage, onChange }) {
  return (
    <select value={selectedLanguage} onChange={(e) => onChange(e.target.value)}>
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang.name} value={lang.name}>
          {lang.name}
          {lang.flag}
        </option>
      ))}
    </select>
  );
}

export default LanguageSwitcher;
