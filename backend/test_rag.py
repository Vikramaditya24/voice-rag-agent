from rag import ingest, retrieve

# Create a dummy txt file to test with
with open("test_doc.txt", "w") as f:
    f.write("""
    NeuroDrift is a company focused on real-time AI orchestration.
    The company was founded in 2023 and is based in Bangalore.
    Their main product is a voice AI platform for enterprise customers.
    NeuroDrift uses LiveKit for WebRTC infrastructure.
    The pricing model is usage-based at $0.05 per minute.
    """)

count = ingest("test_doc.txt", doc_id="test_doc")
print(f"Ingested {count} chunks")

result = retrieve("what is the pricing of NeuroDrift?")
print("Retrieved:\n", result)