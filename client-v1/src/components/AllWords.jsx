import { useState, useEffect } from "react";

export function AllWords({ serverURL }) {
  const [words, setWords] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(serverURL + "/all");
        if (!response.ok) {
          console.log("Request failed");
        }
        const data = await response.json();
        setWords(data);
      } catch (err) {
        console.log(err.message);
      }
    }
    fetchData();
  }, []);

  const w = [
    <tr>
      <th>index</th>
      <th>english</th>
      <th>russian</th>
    </tr>,
  ];
  for (word in words) {
    w.push(
      <tr>
        <td>{word.word_index}</td>
        <td>{word.english}</td>
        <td>{word.russian}</td>
      </tr>,
    );
  }

  return <table>{w}</table>;
}
