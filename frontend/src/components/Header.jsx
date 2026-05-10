import LanguageSwitcher from "./LanguageSwitcher";

function Header({ selectedLanguage, onChange }) {
  return (
    <header>
      LearnFast
      <LanguageSwitcher
        selectedLanguage={selectedLanguage}
        onChange={onChange}
      />
    </header>
  );
}

export default Header;
