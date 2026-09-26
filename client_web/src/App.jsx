import { useState } from "react";
import { AllWords } from "./components/AllWords.jsx";
import { SinglePage } from "./components/SinglePage.jsx";

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

      {view == ALLWORDS ? (
        <AllWords serverURL={SERVERURL} />
      ) : (
        <SinglePage serverURL={SERVERURL} />
      )}
    </>
  );
}
