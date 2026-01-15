import os
import os
from langchain_huggingface import HuggingFaceEmbeddings

# Global cache
_cached_embeddings = None

def get_embeddings():
    global _cached_embeddings
    if _cached_embeddings is None:
        print("⚡ Loading Embedding Model (One-time setup)...")
        # Use a standard, efficient local model
        _cached_embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        print("✅ Embedding Model Loaded.")
    return _cached_embeddings
