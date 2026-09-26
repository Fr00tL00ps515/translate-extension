import { useState, useEffect, useRef } from "react";
import styles from "./SinglePage.module.css";

export function SinglePage({ serverURL }) {
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef([]);

  useEffect(() => {
    async function fetchNumberOfPages() {
      try {
        setIsLoading(true);
        ref.current = [];
        const response = await fetch(serverURL + "/number-of-pages");
        if (!response.ok) {
          console.log("Request failed");
        }
        const data = await response.json();
        const totalPages = data.number_of_pages || 0;
        setNumberOfPages(totalPages);

        for (let i = 0; i < totalPages; i++) {
          const pageRes = await fetch(serverURL + "/page/" + i);
          if (!pageRes.ok) {
            console.log("Request failed");
            break;
          }
          const pageData = await pageRes.json();
          ref.current.push(pageData);
        }
      } catch (err) {
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNumberOfPages();
  }, [serverURL]);

  const currentWords = ref.current[currentPage] || [];

  const handlePrev = () => {
    if (numberOfPages > 0) {
      setCurrentPage((prev) => (prev - 1 + numberOfPages) % numberOfPages);
    }
  };

  const handleNext = () => {
    if (numberOfPages > 0) {
      setCurrentPage((prev) => (prev + 1) % numberOfPages);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pagination}>
        <button
          className={styles.pageButton}
          onClick={handlePrev}
          disabled={numberOfPages <= 1}
        >
          prev
        </button>
        <span className={styles.pageInfo}>
          Page {numberOfPages > 0 ? currentPage + 1 : 0} of {numberOfPages}
        </span>
        <button
          className={styles.pageButton}
          onClick={handleNext}
          disabled={numberOfPages <= 1}
        >
          next
        </button>
      </div>

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
            {isLoading && currentWords.length === 0 ? (
              <tr>
                <td colSpan="3" className={styles.emptyState}>
                  Loading...
                </td>
              </tr>
            ) : currentWords.length === 0 ? (
              <tr>
                <td colSpan="3" className={styles.emptyState}>
                  No words found
                </td>
              </tr>
            ) : (
              currentWords.map((word) => (
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
