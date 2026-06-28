import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
  useRoomContext,
} from "@livekit/components-react";
import { useEffect, useState } from "react";
import { RoomEvent } from "livekit-client";

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

function AgentInner({ onEnd, onMessage, setLive }) {
  const { state, audioTrack } = useVoiceAssistant();
  const room = useRoomContext();

  useEffect(() => {
    const isLive = state === "speaking" || state === "listening";
    setLive(isLive);
  }, [state]);

  useEffect(() => {
    if (!room) return;

    const handleTranscription = (segments, participant) => {
      segments.forEach((seg) => {
        if (!seg.final) return;
        const role = participant?.isAgent ? "agent" : "user";
        onMessage(role, seg.text);
      });
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => room.off(RoomEvent.TranscriptionReceived, handleTranscription);
  }, [room]);

  const isLive = state === "speaking" || state === "listening";

  return (
    <>
      <div className="call-state">
        <span className={`state-dot ${isLive ? "live" : ""}`} />
        <span>Agent {state ?? "idle"}</span>
      </div>
      <div className="viz-wrap">
        <BarVisualizer
          state={state}
          trackRef={audioTrack}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <button className="mic-btn active" onClick={onEnd} title="End call">
        <MicIcon />
      </button>
      <button className="end-btn" onClick={onEnd}>disconnect</button>
      <RoomAudioRenderer />
    </>
  );
}

export default function CallControls({ token, serverUrl, onStart, onEnd, onMessage, setLive }) {
  if (!token) {
    return (
      <>
        <div className="call-state">
          <span className="state-dot" />
          <span>Not connected</span>
        </div>
        <button className="mic-btn" onClick={onStart} title="Start call">
          <MicIcon />
        </button>
        <span style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          tap to connect
        </span>
      </>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={onEnd}
      style={{ display: "contents" }}
    >
      <AgentInner onEnd={onEnd} onMessage={onMessage} setLive={setLive} />
    </LiveKitRoom>
  );
}