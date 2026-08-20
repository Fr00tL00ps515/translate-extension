from fastapi import FastAPI, Response, status
from pydantic import BaseModel

app = FastAPI()

class DB():
    def __init__(self):
        self.words = []

    def add(self, english : str, russian : str) -> bool:
        for i in self.words:
            if i['english'] == english:
                return False 
        self.words.append({'english' : english, 'russian' : russian})
        return True


db = DB()

@app.post('/')
def addNewWord(english : str, russian : str, response : Response):
    res : bool = db.add(english, russian)
    if res: 
        response.status_code = status.HTTP_400_BAD_REQUEST
    response.status_code = status.HTTP_200_OK
    return {} 
    
