import os
import uuid
import json
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from livekit.api import LiveKitAPI, AccessToken, VideoGrants

from rag import ingest, retrieve, list_docs, delete_doc

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
CONFIG_FILE = BASE_DIR / "config.json"


def load_config():
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text())
    return {"system_prompt": "You are a helpful voice assistant. Answer based on the provided context when available."}


def save_config(data: dict):
    CONFIG_FILE.write_text(json.dumps(data))


# ---------- endpoints ----------

@app.get("/config")
def get_config():
    return load_config()


class ConfigUpdate(BaseModel):
    system_prompt: str

@app.post("/config")
def update_config(body: ConfigUpdate):
    data = load_config()
    data["system_prompt"] = body.system_prompt
    save_config(data)
    return {"status": "ok"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in [".pdf", ".txt"]:
        raise HTTPException(400, "Only PDF and TXT files supported")

    doc_id = f"{Path(file.filename).stem}_{uuid.uuid4().hex[:8]}"
    save_path = UPLOAD_DIR / f"{doc_id}{ext}"

    content = await file.read()
    save_path.write_bytes(content)

    chunk_count = ingest(str(save_path), doc_id)
    return {"doc_id": doc_id, "filename": file.filename, "chunks": chunk_count}


@app.get("/documents")
def get_docs():
    return {"docs": list_docs()}


@app.delete("/documents/{doc_id}")
def remove_doc(doc_id: str):
    success = delete_doc(doc_id)
    if not success:
        raise HTTPException(404, "Doc not found")
    return {"status": "deleted"}


class TokenRequest(BaseModel):
    room: str = "voice-room"
    identity: str = "user"

@app.post("/token")
def get_token(body: TokenRequest):
    api_key = os.environ["LIVEKIT_API_KEY"]
    api_secret = os.environ["LIVEKIT_API_SECRET"]
    livekit_url = os.environ["LIVEKIT_URL"]

    token = AccessToken(api_key, api_secret) \
        .with_identity(body.identity) \
        .with_grants(VideoGrants(room_join=True, room=body.room)) \
        .to_jwt()

    return {"token": token, "url": livekit_url, "room": body.room}