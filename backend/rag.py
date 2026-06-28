import os
from pathlib import Path
import chromadb
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader

# Load embedding model once at startup (downloads ~90MB first time)
model = SentenceTransformer("all-MiniLM-L6-v2")

# ChromaDB persisted locally
BASE_DIR = Path(__file__).parent
chroma_client = chromadb.PersistentClient(path=str(BASE_DIR / "chroma_db"))
collection = chroma_client.get_or_create_collection(name="knowledge_base")


def ingest(file_path: str, doc_id: str) -> int:
    """
    Read a PDF or txt file, chunk it, embed each chunk, store in ChromaDB.
    Returns number of chunks stored.
    """
    path = Path(file_path)
    
    # Extract raw text
    if path.suffix.lower() == ".pdf":
        reader = PdfReader(file_path)
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    else:
        text = path.read_text(encoding="utf-8")

    # Chunk: 500 chars, 50 char overlap
    chunks = []
    chunk_size = 500
    overlap = 50
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap

    if not chunks:
        return 0

    # Embed all chunks
    embeddings = model.encode(chunks).tolist()

    # Store in ChromaDB — delete old version of same doc first
    existing = collection.get(where={"doc_id": doc_id})
    if existing["ids"]:
        collection.delete(ids=existing["ids"])

    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=[{"doc_id": doc_id, "chunk_index": i} for i in range(len(chunks))]
    )

    return len(chunks)


def retrieve(query: str, top_k: int = 5) -> str:
    """
    Embed the query, find top_k similar chunks, return as a single string.
    """
    if collection.count() == 0:
        return ""

    query_embedding = model.encode([query]).tolist()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=min(top_k, collection.count())
    )

    chunks = results["documents"][0]
    return "\n\n---\n\n".join(chunks)

def retrieve_all() -> str:
    if collection.count() == 0:
        return ""
    all_items = collection.get()
    return "\n\n---\n\n".join(all_items["documents"])

def list_docs() -> list[str]:
    """Return unique doc_ids currently in the KB."""
    if collection.count() == 0:
        return []
    all_items = collection.get()
    doc_ids = list({m["doc_id"] for m in all_items["metadatas"]})
    return doc_ids


def delete_doc(doc_id: str) -> bool:
    """Delete all chunks belonging to a doc."""
    existing = collection.get(where={"doc_id": doc_id})
    if not existing["ids"]:
        return False
    collection.delete(ids=existing["ids"])
    return True