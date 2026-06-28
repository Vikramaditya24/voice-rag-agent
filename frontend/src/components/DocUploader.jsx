import { useState, useEffect } from "react";
import axios from "axios";

export default function DocUploader() {
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);

const fetchDocs = async () => {
  try {
    const res = await axios.get("http://localhost:8000/documents");
    console.log("docs response:", res.data);  // add this
    setDocs(res.data.docs ?? []);
  } catch (e) {
    console.error("fetchDocs failed:", e);
    setDocs([]);  // prevent undefined crash
  }
};
  useEffect(() => { fetchDocs(); }, []);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    await axios.post("http://localhost:8000/upload", form);
    await fetchDocs();
    setUploading(false);
  };

  const remove = async (docId) => {
    await axios.delete(`http://localhost:8000/documents/${docId}`);
    await fetchDocs();
  };

  return (
    <div>
      <h2>Knowledge Base</h2>
      <label className="file-label">
        {uploading ? "Uploading..." : "Click to upload PDF or TXT"}
        <input type="file" accept=".pdf,.txt" onChange={upload} />
      </label>
      <ul className="doc-list">
        {docs.length === 0 && (
          <li style={{ color: "#666" }}>No documents uploaded</li>
        )}
        {docs.map((doc) => (
          <li key={doc}>
            <span>📄 {doc}</span>
            <button className="btn-small" onClick={() => remove(doc)}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}