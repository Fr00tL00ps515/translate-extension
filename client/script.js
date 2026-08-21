const SERVER_URL = "http://127.0.0.1:8000/";

document.addEventListener("DOMContentLoaded", async () => {
  const wordsContainer = document.getElementById("words");
  const status = document.getElementById("status");

  try {
    const response = await fetch(SERVER_URL);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const words = await response.json();

    for (const [english, russian] of Object.entries(words)) {
      const row = document.createElement("tr");

      const englishCell = document.createElement("td");
      englishCell.textContent = english;

      const russianCell = document.createElement("td");
      russianCell.textContent = russian;

      row.append(englishCell, russianCell);
      wordsContainer.appendChild(row);
    }

    status.textContent = Object.keys(words).length ? "" : "No saved words.";
  } catch (error) {
    console.error(error);
    status.textContent = "Could not load words from the server.";
  }
});
