from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
import json

app = FastAPI()
engine = create_engine("sqlite:///./app.db", echo=True)

number_of_pages = 0
number_of_words = 0

with open("./tables_number.txt", "ar") as f:
    if f.read() == "":
        f.write(json.dumps({'number_of_pages' : number_of_pages, "number_of_words" : number_of_words}))
    else:
        tables_number = json.loads(f.read())
        number_of_pages = tables_number['number_of_pages']
        number_of_words = tables_number['number_of_words']









app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Word(BaseModel):
    english:str
    russian:str



@app.post('/')
def addNewWord(word : Word, response : Response):
    
    print('try to add a new word: ' + word.english)
    if number_of_pages == 0:
        with engine.begin() as conn:
            conn.execute(text(f"CREATE TABLE Table{number_of_pages} (WordIndex INT, English TEXT, Russian TEXT)"))
        number_of_pages = number_of_pages + 1

    

    
    


@app.get('/')
def getAllWords():
    pass