Got it. Here's the corrected README:

---

```markdown
# NeuroDrift Voice Agent

A real-time voice AI agent with RAG over uploaded documents. Built with LiveKit (WebRTC), Deepgram (STT), Groq (LLM), Cartesia (TTS), and ChromaDB (vector store).

---

## Architecture

```
User speaks → LiveKit (WebRTC) → Deepgram STT → Groq LLM + RAG context → Cartesia TTS → User hears
```

**RAG pipeline:** Uploaded documents are chunked, embedded via `sentence-transformers`, and stored in ChromaDB. At session start, the full knowledge base is injected into the agent's system prompt so every response is grounded in uploaded content.

---

## Stack

| Layer | Choice |
|---|---|
| Voice transport | LiveKit Cloud (WebRTC) |
| STT | Deepgram Nova-2 |
| LLM | Groq `llama-3.1-8b-instant` |
| TTS | Cartesia |
| Vector store | ChromaDB (local, persisted) |
| Embeddings | `sentence-transformers` `all-MiniLM-L6-v2` (local) |
| Backend | Python FastAPI |
| Frontend | React + Vite |

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- API keys for: LiveKit, Deepgram, Groq, Cartesia

---

## Setup

### 1. Clone

```bash
git clone https://github.com/Vikramaditya24/voice-rag-agent
cd voice-rag-agent
```

### 2. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install fastapi uvicorn python-multipart livekit-agents livekit-plugins-deepgram livekit-plugins-groq livekit-plugins-cartesia livekit-api chromadb sentence-transformers pypdf python-dotenv groq
```

### 3. Backend environment variables

Create `backend/.env`:

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
DEEPGRAM_API_KEY=your_deepgram_key
GROQ_API_KEY=your_groq_key
CARTESIA_API_KEY=your_cartesia_key
```

### 4. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_LIVEKIT_URL=wss://your-project.livekit.cloud
```

---

## Running

You need **3 terminals** running simultaneously.

### Terminal 1 — FastAPI backend

```bash
cd backend
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
uvicorn main:app --reload --port 8000
```

### Terminal 2 — LiveKit agent worker

```bash
cd backend
venv\Scripts\activate
python agent.py dev
```

### Terminal 3 — Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## LiveKit setup

This project uses **LiveKit Cloud** (free tier).

1. Sign up at [cloud.livekit.io](https://cloud.livekit.io)
2. Create a project
3. Copy the WebSocket URL, API key, and API secret into `backend/.env`

No local LiveKit installation needed.

---

## Usage

1. **Upload documents** — click "Upload File" in the Knowledge Base panel (PDF or TXT)
2. **Edit system prompt** — modify instructions in the System Prompt panel, click Save
3. **Start a call** — click the mic button in the Call panel
4. **Ask questions** — speak naturally; the agent answers using uploaded document content
5. **End call** — click disconnect or the mic button again

---

## How RAG works

1. On upload: document is chunked (1000 chars, 100 char overlap) → embedded with `sentence-transformers` → stored in ChromaDB
2. On call start: full knowledge base is retrieved and injected into the agent's system prompt
3. LLM receives: system prompt + KB context + conversation history
4. Agent answers grounded in document content, speaks via Cartesia TTS

**Note:** Documents uploaded during an active call take effect on the next session — context is baked into the system prompt at session start.

---

## Known limitations

- Documents uploaded mid-call are not available until the next session
- PDF image/graphic content is not extracted (text only)
- `retrieve_all()` loads the full KB into context — works well for small documents; large KBs should switch to semantic top-k retrieval
- ChromaDB is local — not suitable for multi-user production without a hosted vector DB
- Groq free tier has rate limits — sufficient for demos

---

## Project structure

```
neurodrift-voice-agent/
├── backend/
│   ├── agent.py          # LiveKit agent worker — STT → RAG → LLM → TTS
│   ├── rag.py            # ChromaDB ingestion and retrieval
│   ├── main.py           # FastAPI — upload, config, token endpoints
│   ├── .env.example      # Environment variable template
│   └── .env              # API keys (not committed)
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── CallControls.jsx
│           ├── PromptEditor.jsx
│           ├── DocUploader.jsx
│           └── Terminal.jsx
├── .env.example          # Frontend env template
└── README.md
```
```

---

