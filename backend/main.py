
import requests
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app = FastAPI(title="Local LLM Chat Assistant")

app.mount(
    "/static",
    StaticFiles(directory=str(FRONTEND_DIR)),
    name="static"
)

class ChatRequest(BaseModel):
    messages: list[dict[str, str]]

@app.get("/")
def home():
    return FileResponse(FRONTEND_DIR / "index.html")

@app.post("/ask")
def ask(request: ChatRequest):
    try:
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "qwen2.5:0.5b",
                "messages": request.messages,
                "stream": False
            },
            timeout=180
        )

        response.raise_for_status()
        result = response.json()

        return {
            "answer": result["message"]["content"]
        }

    except requests.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Local model error: {str(e)}"
        )
