import { useState, useEffect } from "react";
import axios from "axios";

export default function PromptEditor() {
  const [prompt, setPrompt] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8000/config").then((r) => setPrompt(r.data.system_prompt));
  }, []);

  const save = async () => {
    await axios.post("http://localhost:8000/config", { system_prompt: prompt });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="panel-title">System Prompt</div>
      <textarea
        className="prompt-textarea"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter system instructions..."
        spellCheck={false}
      />
      <button className={`save-btn ${saved ? "saved" : ""}`} onClick={save}>
        {saved ? "✓ saved" : "Save changes"}
      </button>
    </>
  );
}