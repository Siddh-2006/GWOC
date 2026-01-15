from rag.ingest import ingest_docs
import os
import shutil
from dotenv import load_dotenv

load_dotenv()

VECTOR_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "rag", "chroma_db")

if __name__ == "__main__":
    print("Clearing existing index...")
    if os.path.exists(VECTOR_DB_PATH):
        shutil.rmtree(VECTOR_DB_PATH)
    
    print("Re-indexing...")
    ingest_docs()
    print("Done.")
