import { useState } from "react";
import { AllWords } from "./components/AllWords.jsx";

const SERVERURL = "http://localhost:8000";

const ALLWORDS = "allWords";
const SINGLEPAGE = "singlePage";

export function App() {
  const [view, setView] = useState(ALLWORDS);
  return (
    <>
      <button onClick={() => setView(view == ALLWORDS ? SINGLEPAGE : ALLWORDS)}>
        change view
      </button>

      <AllWords serverURL={SERVERURL} />
    </>
  );
}
