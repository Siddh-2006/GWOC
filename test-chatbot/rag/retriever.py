from langchain_pinecone import PineconeVectorStore
from .embeddings import get_embeddings
import os

def retrieve_context(query):
    embeddings = get_embeddings()
    if not embeddings:
        return "RAG Unavailable (No API Key)"
    
    index_name = os.getenv("PINECONE_INDEX_NAME")
    if not index_name:
         # Fallback or error if not set
         return "Pinecone Index Name missing."

    try:
        # Connect to Pinecone Index (Requires PINECONE_API_KEY env var)
        vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)
        docs = vectorstore.similarity_search(query, k=2) # Reduced from 3 to 2 for speed
        return "\n\n".join([d.page_content for d in docs])
    except Exception as e:
        print(f"RAG Retrieval Error (Pinecone): {e}")
        return ""

