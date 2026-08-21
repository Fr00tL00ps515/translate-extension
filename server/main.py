from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Word():
    def __init__(self, english, russian):
        self.english = english
        self.russian = russian

    def get(self):
        return {self.english : self.russian}
    def getEnglish(self):
        return self.english

    
class DB():
    def __init__(self):
        self.words : list[Word] = []

    def add(self, english : str, russian : str) -> bool:
        for i in self.words:
            if i.getEnglish() == english:
                return False 
        self.words.append(Word(english, russian))
        
        return True

    def getAll(self):
        res : dict = {}
        for i in self.words:
            res.update(i.get())
        return res


db = DB()

@app.post('/')
def addNewWord(english : str, russian : str, response : Response):
    print('try to add a new word: ' + english)
    res : bool = db.add(english, russian)
    if res: 
        response.status_code = status.HTTP_400_BAD_REQUEST
    response.status_code = status.HTTP_200_OK
    return {} 
    


@app.get('/')
def getAllWords():
    return db.getAll()