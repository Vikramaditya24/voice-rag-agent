import os
import asyncio
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

from rag import retrieve

load_dotenv()


def get_system_prompt() -> str:
    config_file = Path("./config.json")
    if config_file.exists():
        data = json.loads(config_file.read_text())
        return data.get("system_prompt", "You are a helpful voice assistant.")
    return "You are a helpful voice assistant."


class VoiceAgent(Agent):
    def __init__(self):
        super().__init__(instructions=get_system_prompt())

    async def on_user_turn_completed(
        self,
        turn_ctx: llm.ChatContext,
        new_message: llm.ChatMessage,
    ) -> None:
        """
        Called after STT finishes, before LLM responds.
        We query RAG and inject context here.
        """
        user_text = ""
        if isinstance(new_message.content, list):
            for part in new_message.content:
                if hasattr(part, "text"):
                    user_text += part.text
        elif isinstance(new_message.content, str):
            user_text = new_message.content

        if not user_text:
            return

        context = retrieve(user_text)

        if context:
            turn_ctx.messages.append(
                llm.ChatMessage(
                    role="system",
                    content=f"Relevant context from uploaded documents:\n\n{context}"
                )
            )


async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    session = AgentSession(
        stt=deepgram.STT(),
        llm=groq.LLM(model="llama-3.3-70b-versatile"),
        tts=cartesia.TTS(),
    
    )

    await session.start(
        room=ctx.room,
        agent=VoiceAgent(),
    )

    await session.generate_reply(
        instructions="Greet the user and tell them they can ask questions about uploaded documents."
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )