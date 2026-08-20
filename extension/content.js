const SERVER_URL = "https://your-server-domain.com/api/save-word";

function createExportButton() {
  if (document.getElementById("custom-export-btn")) return;

  // Target the action toolbar containing copy/share icons on the translated panel
  const targetContainer = document.body;

  const btn = document.createElement("button");
  btn.id = "custom-export-btn";
  btn.innerText = "🚀 Save";
  btn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    padding: 10px 16px;
    background-color: #1a73e8;
    color: #ffffff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  `;

  btn.addEventListener("click", async () => {
    const sourceText = document.querySelector("textarea")?.value || "";
    // Grab translated text from the main output container
    const translatedEl =
      document.querySelector("span[lang] span") ||
      document.querySelector(".c-wiz span[lang]");
    const translatedText = translatedEl ? translatedEl.innerText : "";

    if (!sourceText || !translatedText) {
      alert("No translation found to export.");
      return;
    }

    const payload = {
      source: sourceText,
      translation: translatedText,
      timestamp: new Date().toISOString(),
    };

    btn.innerText = "Sending...";
    btn.disabled = true;

    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        btn.innerText = "Saved!";
        setTimeout(() => {
          btn.innerText = "🚀 Save";
          btn.disabled = false;
        }, 2000);
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      console.error("Export failed:", err);
      btn.innerText = "Failed";
      setTimeout(() => {
        btn.innerText = "🚀 Save";
        btn.disabled = false;
      }, 2000);
    }
  });

  targetContainer.appendChild(btn);
}

// Observe DOM updates for dynamic SPAs
const observer = new MutationObserver(() => {
  createExportButton();
});

observer.observe(document.body, { childList: true, subtree: true });
createExportButton();
