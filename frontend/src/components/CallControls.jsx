import { useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
} from "@livekit/components-react";
import TranscriptionPanel from "./TranscriptionPanel";

function AssistantInner() {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div>
      <div className={`status ${state === "speaking" || state === "listening" ? "connected" : "idle"}`}>
        Agent: {state ?? "idle"}
      </div>
      <BarVisualizer
        state={state}
        trackRef={audioTrack}
        style={{ height: 60, marginBottom: 12 }}
      />
      <VoiceAssistantControlBar />
      <RoomAudioRenderer />
    </div>
  );
}

export default function CallControls({ token, serverUrl, onStart, onEnd }) {
  if (!token) {
    return (
      <div>
        <h2>Call</h2>
        <div className="status idle">Not connected</div>
        <button className="btn-primary" onClick={onStart}>
          🎙️ Start Call
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Call</h2>
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        audio={true}
        video={false}
        onDisconnected={onEnd}
      >
        <AssistantInner />
        <TranscriptionPanel />
      </LiveKitRoom>
      <button className="btn-danger" onClick={onEnd} style={{ marginTop: 12 }}>
        End Call
      </button>
    </div>
  );
}