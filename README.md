# Translate Extension & Vocabulary Hub

A personal vocabulary learning ecosystem designed to capture, organize, and review translated words directly from Google Translate into a self-hosted database and web dashboard.

---

## 📌 What This Project Does

This project bridges the gap between active web browsing and spaced vocabulary practice. Whenever you look up a word on Google Translate, a dedicated browser extension enables saving that word pair (English–Russian) directly into your personal database with a single click.

The saved vocabulary is then partitioned into fixed-size pages (50 words per page) and accessible via a web dashboard for structured review.

---

## ⚙️ Architecture & How It Works

```
┌───────────────────────────────────────┐
│ Google Translate (Browser Tab)        │
│ └── Content Script (MutationObserver) │
└──────────────────┬────────────────────┘
                   │ POST /?english=...&russian=...
                   ▼
┌───────────────────────────────────────┐
│ FastAPI Backend Service (Port 8000)   │
│ ├── Uniqueness Check (GeneralTable)   │
│ ├── Page Allocator (50 words/chunk)   │
│ └── SQLite DB (app.db)                │
└──────────────────▲────────────────────┘
                   │ GET /all & GET /page/{i}
                   │
┌──────────────────┴────────────────────┐
│ React Frontend Dashboard (Vite)       │
│ ├── AllWords View                     │
│ └── SinglePage Paginated View         │
└───────────────────────────────────────┘
```

### 1. Browser Extension Layer (`extension/`)

- **Technology**: Chrome Extensions Manifest V3, Content Script.
- **Mechanism**: Injects a floating **🚀 Save** button into `https://translate.google.com/*`.
- **Data Capture**: Uses a `MutationObserver` to watch DOM changes on Google Translate. When clicked, it parses the source query textarea and the translated text container, serializes the word pair, and sends an asynchronous HTTP `POST` request to the backend service.

### 2. Backend Service Layer (`server/`)

- **Technology**: FastAPI, SQLAlchemy, SQLite, Pydantic.
- **Storage Strategy**:
  - **`GeneralTable`**: Acts as the global primary store ensuring uniqueness (`English TEXT PRIMARY KEY`). Duplicate entries are rejected with HTTP 400.
  - **Paginated Tables (`Table0`, `Table1`, ...)**: Automatically chunks words into tables of 50 entries each (`WordIndex`, `English`, `Russian`).
  - **Metadata Tracking (`tables_number.txt`)**: Persists the current page counter and word offset across server restarts.
- **REST Endpoints**:
  - `POST /`: Ingests and stores a new word pair.
  - `GET /all`: Returns the complete aggregated dictionary.
  - `GET /page/{page_index}`: Fetches word records for an isolated page chunk.
  - `GET /number-of-pages`: Returns total allocated pages.

### 3. Web Dashboard Layer (`client_web/`)

- **Technology**: React 19, Vite, CSS Modules.
- **Components**:
  - **`AllWords`**: Fetches and renders all dictionary entries in a unified overview table.
  - **`SinglePage`**: Loads and caches pages using `useRef`, enabling navigation (`prev` / `next`) across word pages with dedicated loading and empty states.
  - **Styling**: Modular CSS (`.module.css`) providing modern, responsive card-and-table views.

---

## 🚢 Deployment

The project can be deployed serverlessly on **Azure Container Apps (ACA)** using an automated deployment script (e.g., with the Azure CLI). This allows running the backend container with automatic scaling, persistent file storage for the SQLite database, and public HTTPS ingress for the browser extension and web dashboard.
