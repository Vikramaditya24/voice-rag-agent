import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function DocUploader() {
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const fetchDocs = async () => {
    const res = await axios.get("http://localhost:8000/documents");
    setDocs(res.data.docs);
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
    e.target.value = "";
  };

  const remove = async (docId) => {
    await axios.delete(`http://localhost:8000/documents/${docId}`);
    await fetchDocs();
  };

  return (
    <>
      <div className="panel-title">Knowledge Base</div>
      <div className="doc-list">
        {docs.length === 0 ? (
          <div className="empty-kb">No documents uploaded.<br />Add a file to enable RAG.</div>
        ) : (
          docs.map((doc) => (
            <div key={doc} className="doc-item">
              <span className="doc-name">{doc}</span>
              <button className="doc-del" onClick={() => remove(doc)}>✕</button>
            </div>
          ))
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt"
        onChange={upload}
        style={{ display: "none" }}
      />
      <button className="upload-btn" onClick={() => inputRef.current.click()}>
        {uploading ? "Processing..." : "↑  Upload file"}
      </button>
    </>
  );
}