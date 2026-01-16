import os
from langchain_openai import OpenAIEmbeddings

# Global cache
_cached_embeddings = None

def get_embeddings():
    global _cached_embeddings
    if _cached_embeddings is None:
        # Use OpenAI Embeddings (Lightweight, No PyTorch needed)
        # Defaults to 'text-embedding-3-small' (1536 dimensions)
        print("⚡ Loading OpenAI Embeddings...")
        _cached_embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        print("✅ OpenAI Embedding Model Loaded.")
    return _cached_embeddings
