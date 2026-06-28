import { useState, useEffect } from "react";
import axios from "axios";

export default function PromptEditor() {
  const [prompt, setPrompt] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8000/config").then((res) => {
      setPrompt(res.data.system_prompt);
    });
  }, []);

  const save = async () => {
    await axios.post("http://localhost:8000/config", { system_prompt: prompt });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h2>System Prompt</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={8}
        placeholder="Enter system prompt..."
      />
      <button className="btn-primary" onClick={save}>
        {saved ? "✓ Saved" : "Save Prompt"}
      </button>
    </div>
  );
}