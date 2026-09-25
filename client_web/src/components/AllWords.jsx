import { useState, useEffect } from "react";
import styles from "./AllWords.module.css";

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
  }, [serverURL]);

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.indexCol}>index</th>
              <th className={styles.wordCol}>english</th>
              <th className={styles.wordCol}>russian</th>
            </tr>
          </thead>
          <tbody>
            {words.length === 0 ? (
              <tr>
                <td colSpan="3" className={styles.emptyState}>
                  No words found
                </td>
              </tr>
            ) : (
              words.map((word) => (
                <tr key={word.word_index}>
                  <td className={styles.indexCol}>{word.word_index}</td>
                  <td className={styles.wordCol}>{word.english}</td>
                  <td className={styles.wordCol}>{word.russian}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
