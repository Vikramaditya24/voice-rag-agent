import { useEffect, useRef } from "react";

export default function Terminal({ messages }) {
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <>
      <div className="terminal-bar">
        <span className="terminal-bar-label">Transcript</span>
      </div>
      <div className="terminal-body" ref={bodyRef}>
        {messages.length === 0 ? (
          <div className="t-empty">▸ waiting for conversation...</div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`t-line ${m.role}`}>
              <span className="t-prefix">
                {m.role === "user" ? "you   >" : "agent >"}
              </span>
              <span className="t-text">{m.text}</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}