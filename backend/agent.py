import os
import json
from pathlib import Path
from dotenv import load_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
    Agent,
    AgentSession,
)
from livekit.plugins import deepgram, groq, cartesia
from rag import retrieve_all

load_dotenv()


def get_system_prompt() -> str:
    config_file = Path("./config.json")
    if config_file.exists():
        data = json.loads(config_file.read_text())
        return data.get("system_prompt", "")
    return ""


async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Load KB context at session start
    context = retrieve_all()
    base = get_system_prompt() or "You are a helpful voice assistant."
    
    if context:
        instructions = f"""{base}

The user has uploaded the following documents. This is the ONLY source of truth. Answer questions using ONLY this content. Do not say you cannot see documents.

---
{context}
---"""
    else:
        instructions = base

    print(f"[AGENT] context loaded: {len(context)} chars")

    class VoiceAgent(Agent):
        def __init__(self):
            super().__init__(instructions=instructions)

    session = AgentSession(
        stt=deepgram.STT(),
        llm=groq.LLM(model="llama-3.1-8b-instant"),
        # llm=groq.LLM(model="llama-3.3-70b-versatile"),
        # tts=groq.TTS(voice="autumn"),
        tts=cartesia.TTS(),
    )

    await session.start(
        room=ctx.room,
        agent=VoiceAgent(),
    )

    await session.generate_reply(
        instructions="Greet the user briefly and tell them you have access to their uploaded documents."
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))