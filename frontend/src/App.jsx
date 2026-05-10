import { useState } from "react";
import Header from "./components/Header";

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  return (
    <Header
      selectedLanguage={selectedLanguage}
      onChange={setSelectedLanguage}
    />
  );
}

export default App;
