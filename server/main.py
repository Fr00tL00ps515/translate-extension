import json
from pathlib import Path

from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "app.db"
TABLES_META_PATH = BASE_DIR / "tables_number.txt"
GENERAL_TABLE = "GeneralTable"
PAGE_WORD_LIMIT = 50
DEFAULT_TABLE_NUMBERS = {"number_of_pages": 0, "number_of_words": 0}

app = FastAPI(title="Translate Extension API")
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)


class Word(BaseModel):
    english: str
    russian: str


def save_table_numbers(table_numbers: dict[str, int]) -> None:
    with TABLES_META_PATH.open("w", encoding="utf-8") as file:
        json.dump(table_numbers, file)


def load_table_numbers() -> dict[str, int]:
    if not TABLES_META_PATH.exists():
        save_table_numbers(DEFAULT_TABLE_NUMBERS.copy())

    try:
        with TABLES_META_PATH.open("r", encoding="utf-8") as file:
            loaded_data = json.load(file)
    except (json.JSONDecodeError, OSError):
        save_table_numbers(DEFAULT_TABLE_NUMBERS.copy())
        return DEFAULT_TABLE_NUMBERS.copy()

    if not isinstance(loaded_data, dict):
        save_table_numbers(DEFAULT_TABLE_NUMBERS.copy())
        return DEFAULT_TABLE_NUMBERS.copy()

    normalized = DEFAULT_TABLE_NUMBERS.copy()
    for key, value in loaded_data.items():
        if key in normalized and isinstance(value, int):
            normalized[key] = value

    save_table_numbers(normalized)
    return normalized


# Table with all saved words
def ensure_general_table() -> None:
    with engine.begin() as connection:
        connection.execute(
            text(
                f'CREATE TABLE IF NOT EXISTS "{GENERAL_TABLE}" '
                "(English TEXT PRIMARY KEY, Russian TEXT)"
            )
        )


def ensure_page_table(page_index: int) -> str:
    table_name = f"Table{page_index}"
    with engine.begin() as connection:
        connection.execute(
            text(
                f'CREATE TABLE IF NOT EXISTS "{table_name}" '
                "(WordIndex INTEGER, English TEXT, Russian TEXT)"
            )
        )
    return table_name


ensure_general_table()
table_numbers = load_table_numbers()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/")
def add_word(
    word: Word | None = None,
    english: str | None = None,
    russian: str | None = None,
):
    if word is None:
        if english is None or russian is None:
            raise HTTPException(
                status_code=400,
                detail="Provide a word payload or both english and russian values.",
            )
        word = Word(english=english, russian=russian)

    word.english = word.english.strip()
    word.russian = word.russian.strip()

    if not word.english or not word.russian:
        raise HTTPException(status_code=400, detail="English and Russian values cannot be empty.")

    table_numbers = load_table_numbers()

    if table_numbers["number_of_pages"] == 0 or table_numbers["number_of_words"] >= PAGE_WORD_LIMIT:
        current_page_index = table_numbers["number_of_pages"]
        table_name = ensure_page_table(current_page_index)
        table_numbers["number_of_pages"] += 1
        table_numbers["number_of_words"] = 0
    else:
        current_page_index = table_numbers["number_of_pages"] - 1
        table_name = ensure_page_table(current_page_index)

    try:
        with engine.begin() as connection:
            connection.execute(
                text(f'INSERT INTO "{GENERAL_TABLE}" (English, Russian) VALUES (:english, :russian)'),
                {"english": word.english, "russian": word.russian},
            )
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=400, detail="Word already exists in the database.") from exc

    try:
        with engine.begin() as connection:
            connection.execute(
                text(
                    f'INSERT INTO "{table_name}" (WordIndex, English, Russian) '
                    "VALUES (:word_index, :english, :russian)"
                ),
                {
                    "word_index": table_numbers["number_of_words"],
                    "english": word.english,
                    "russian": word.russian,
                },
            )
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail="Failed to save word to page table.") from exc

    table_numbers["number_of_words"] += 1
    save_table_numbers(table_numbers)

   

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("page/{page_index}")
def get_page(page_index: int):
    table_name = f"Table{page_index}"

    try:
        with engine.begin() as connection:
            rows = connection.execute(
                text(f'SELECT WordIndex, English, Russian FROM "{table_name}" ORDER BY WordIndex'),
            ).mappings().all()
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=404, detail=f"Page {page_index} not found.") from exc

    return [
        {
            "word_index": row["WordIndex"],
            "english": row["English"],
            "russian": row["Russian"],
        }
        for row in rows
    ]

@app.get("/all")
def get_all_words():
    table_numbers = load_table_numbers()
    res = []
    try:
        with engine.begin() as connection:
            for page in range(table_numbers['number_of_pages']):
                table_name = f"Table{page}"
                rows = connection.execute(
                                text(f'SELECT WordIndex, English, Russian FROM "{table_name}" ORDER BY WordIndex'),
                            ).all()
                for row in rows:
                    res.append({"word_index" : row[0], "english" : row[1], "russian" : row[2]})

    except SQLAlchemyError as exc:
        raise HTTPException(status_code=404, detail="Something went wrong") from exc

    return res