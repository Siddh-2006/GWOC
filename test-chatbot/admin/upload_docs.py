import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

# Explicitly load .env from parent directory
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
print(f"Loading .env from: {env_path}")

load_dotenv(dotenv_path=env_path, override=True)
print(f"Loaded .env via dotenv. OPENAI_KEY present: {bool(os.getenv('OPENAI_API_KEY'))}")

from rag.ingest import ingest_docs

if __name__ == "__main__":
    print("Starting document ingestion...")
    ingest_docs()
    print("Ingestion complete.")
