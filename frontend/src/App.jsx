import { useState } from "react";
import PromptEditor from "./components/PromptEditor";
import DocUploader from "./components/DocUploader";
import CallControls from "./components/CallControls";
import Terminal from "./components/Terminal";
import "@livekit/components-styles";
import "./App.css";

export default function App() {
  const [token, setToken] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);
  const [messages, setMessages] = useState([]);
  const [live, setLive] = useState(false);
  const [error, setError] = useState(null);

  const startCall = async () => {
  try {
    const res = await fetch("http://localhost:8000/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room: "voice-room", identity: "user" }),
    });
    if (!res.ok) throw new Error("Backend unreachable");
    const data = await res.json();
    setToken(data.token);
    setServerUrl(data.url);
  } catch (e) {
    setError("Could not connect. Is the backend running?");
    setTimeout(() => setError(null), 4000);
  }
};

  const endCall = () => {
    setToken(null);
    setServerUrl(null);
    setLive(false);
  };

  const addMessage = (role, text) => {
    setMessages((prev) => [...prev, { role, text }]);
  };

  return (
    <div className="layout">
      <header className="topbar">
        <div className="topbar-logo" />
        <span className="topbar-name">NeuroDrift Voice Agent</span>
        <div className="topbar-sep" />
        <span className="topbar-tag">RAG · STT · TTS · LiveKit</span>
      </header>

      <aside className="left-panel">
        <PromptEditor />
      </aside>

      <main className={`center-panel ${live ? "live" : ""}`}>
        {error && (
          <div style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: 4,
            padding: "8px 16px",
            fontSize: 12,
            color: "#999",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}>
            {error}
          </div>
        )}
        <CallControls
          token={token}
          serverUrl={serverUrl}
          onStart={startCall}
          onEnd={endCall}
          onMessage={addMessage}
          setLive={setLive}
        />
      </main>

      <aside className="right-panel">
        <DocUploader />
      </aside>

      <footer className="terminal">
        <Terminal messages={messages} />
      </footer>
    </div>
  );
}