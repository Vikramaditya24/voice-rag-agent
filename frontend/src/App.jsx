import { useState } from "react";
import CallControls from "./components/CallControls";
import PromptEditor from "./components/PromptEditor";
import DocUploader from "./components/DocUploader";
import "@livekit/components-styles";
import "./App.css";

export default function App() {
  const [token, setToken] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);

const startCall = async () => {
  const res = await fetch("http://localhost:8000/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room: "voice-room", identity: "user" }),
  });
  const data = await res.json();
  setToken(data.token);
  setServerUrl(data.url);
};

  const endCall = () => {
    setToken(null);
    setServerUrl(null);
  };

  return (
    <div className="app">
      <h1>🎙️ NeuroDrift Voice Agent</h1>
      <div className="panels">
        <div className="panel">
          <PromptEditor />
        </div>
        <div className="panel center">
          <CallControls
            token={token}
            serverUrl={serverUrl}
            onStart={startCall}
            onEnd={endCall}
          />
        </div>
        <div className="panel">
          <DocUploader />
        </div>
      </div>
    </div>
  );
}