const SERVER_URL = "http://127.0.0.1:8000/";

function createExportButton() {
  if (document.getElementById("custom-export-btn")) return;

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
    const sourceText =
      document
        .querySelector('textarea[aria-label="Source text"]')
        ?.value.trim() ||
      document.querySelector("textarea")?.value.trim() ||
      "";

    const translatedText =
      document.querySelector('span[jsname="W297wb"]')?.innerText.trim() ||
      document.querySelector(".ryNqvb")?.innerText.trim() ||
      document
        .querySelector("[data-language-for-alternatives] span")
        ?.innerText.trim() ||
      "";

    if (!sourceText || !translatedText) {
      alert("No translation found to export.");
      return;
    }

    btn.innerText = "Sending...";
    btn.disabled = true;

    try {
      const params = new URLSearchParams({
        english: sourceText,
        russian: translatedText,
      });

      const response = await fetch(`${SERVER_URL}?${params}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      btn.innerText = "Saved!";
    } catch (error) {
      console.error("Export failed:", error);
      btn.innerText = "Failed";
    } finally {
      setTimeout(() => {
        btn.innerText = "🚀 Save";
        btn.disabled = false;
      }, 2000);
    }
  });

  document.body.appendChild(btn);
}

const observer = new MutationObserver(createExportButton);

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

createExportButton();
