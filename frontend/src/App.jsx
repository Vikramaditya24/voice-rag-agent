import React, { useState } from "react";
import PromptEditor from "./components/PromptEditor";
import DocUploader from "./components/DocUploader";
import CallControls from "./components/CallControls";
import Terminal from "./components/Terminal";
import ThemeSwitcher from "./components/ThemeSwitcher";
import "@livekit/components-styles";
import "./App.css";
import axios from "axios";

export default function App() {
  const [token, setToken] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);
  const [messages, setMessages] = useState([]);
  const [live, setLive] = useState(false);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState({
    left: false,
    right: false,
    terminal: false
  });

  const startCall = async () => {
    try {
      const res = await axios.post("http://localhost:8000/token", {
        room: "voice-room",
        identity: "user",
      });
      setToken(res.data.token);
      setServerUrl(res.data.url);
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

  const togglePanel = (panel) => {
    setCollapsed(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };

  // How many of the three surrounding panels are closed right now (0-3).
  // The mic grows a step for each one, so it's most prominent when the
  // user has cleared everything else away to focus on the call.
  const expandLevel = [collapsed.left, collapsed.right, collapsed.terminal].filter(Boolean).length;

  const getLayoutClass = () => {
    const classes = [];
    if (collapsed.left) classes.push('left-collapsed');
    if (collapsed.right) classes.push('right-collapsed');
    if (collapsed.left && collapsed.right) classes.push('both-collapsed');
    if (collapsed.terminal) classes.push('terminal-collapsed');
    return classes.join(' ');
  };

  return (
    <div className={`layout ${getLayoutClass()}`}>
      {/* Topbar */}
      <header className="topbar">
        <button className="mobile-menu-btn" onClick={() => {}}>☰</button>
        <div className="topbar-logo" />
        <span className="topbar-name">NeuroDrift <span>Voice</span></span>
        <div className="topbar-sep" />
        <span className="topbar-tag">RAG · STT · TTS · LiveKit</span>
        <ThemeSwitcher />
      </header>

      {/* Left Panel */}
      <aside className={`left-panel ${collapsed.left ? 'collapsed' : ''}`}>
        <div className="panel-header">
          {!collapsed.left && <span className="panel-title">System Prompt</span>}
          <button className="panel-toggle" onClick={() => togglePanel('left')}>
            {collapsed.left ? '▶' : '◀'}
          </button>
        </div>
        {!collapsed.left && (
          <div className="panel-content">
            <PromptEditor />
          </div>
        )}
      </aside>

      {/* Center Panel */}
      <main className={`center-panel ${live ? "live" : ""}`} style={{ "--expand": expandLevel }}>
        {error && (
          <div style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--bg-primary)",
            borderRadius: "var(--radius-md)",
            padding: "8px 20px",
            fontSize: 12,
            color: "#ef4444",
            zIndex: 10,
            boxShadow: "var(--shadow-in)",
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

      {/* Right Panel */}
      <aside className={`right-panel ${collapsed.right ? 'collapsed' : ''}`}>
        <div className="panel-header">
          {!collapsed.right && <span className="panel-title">Knowledge Base</span>}
          <button className="panel-toggle" onClick={() => togglePanel('right')}>
            {collapsed.right ? '◀' : '▶'}
          </button>
        </div>
        {!collapsed.right && (
          <div className="panel-content">
            <DocUploader />
          </div>
        )}
      </aside>

      {/* Terminal */}
      <footer className={`terminal ${collapsed.terminal ? 'collapsed' : ''}`}>
        <div className="terminal-bar">
          <span className="terminal-bar-label">
            Transcript
            <span className="count">{messages.length}</span>
          </span>
          <button className="terminal-toggle" onClick={() => togglePanel('terminal')}>
            {collapsed.terminal ? '▾' : '▴'}
          </button>
        </div>
        {!collapsed.terminal && <Terminal messages={messages} />}
      </footer>
    </div>
  );
}