import os
from langchain_chroma import Chroma
# fix import for embeddings
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from rag.embeddings import get_embeddings
from langchain_core.documents import Document

VECTOR_DB_PATH = os.path.join(os.path.dirname(__file__), "chroma_db")
DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def ingest_docs():
    embeddings = get_embeddings()
    if not embeddings:
        print("No embeddings available. Check API Key.")
        return

    docs = []
    # 1. Load from data directory txt/md files
    if not os.path.exists(DATA_PATH):
        os.makedirs(DATA_PATH)
        print(f"Created data directory at {DATA_PATH}. Please add .txt or .md files there.")
        # Create a sample file
        with open(os.path.join(DATA_PATH, "mindsettler_info.md"), "w") as f:
            f.write("# MindSettler\nMindSettler is a mental health platform...\n(Placeholder)")
    
    for filename in os.listdir(DATA_PATH):
        if filename.endswith(".txt") or filename.endswith(".md"):
            path = os.path.join(DATA_PATH, filename)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                docs.append(Document(page_content=content, metadata={"source": filename}))

    if not docs:
        print("No documents to ingest.")
        return

    # 2. Chunking
    try:
        from langchain.text_splitter import CharacterTextSplitter
    except ImportError:
        from langchain_text_splitters import CharacterTextSplitter
    splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = splitter.split_documents(docs)

    # 3. Store in Pinecone
    from langchain_pinecone import PineconeVectorStore
    import time
    
    index_name = os.getenv("PINECONE_INDEX_NAME")
    if not index_name:
        print("❌ PINECONE_INDEX_NAME not set in .env")
        return

    print(f"Total chunks to ingest: {len(chunks)}")
    print(f"Target Pinecone Index: {index_name}")
    
    # We use the class method to initialize/add
    # PineconeVectorStore.from_documents(chunks, embeddings, index_name=index_name)
    # But to prevent timeout on large batches, let's keep the manual batch loop 
    # and use from_existing_index + add_documents
    
    vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)
    
    batch_size = 5
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        print(f"Ingesting batch {i//batch_size + 1} of {-(-len(chunks)//batch_size)}...")
        try:
            vectorstore.add_documents(batch)
            time.sleep(1) # Gentle rate limit
        except Exception as e:
            print(f"Error ingesting batch: {e}")
            if "429" in str(e):
                print("Hit rate limit. Waiting 10 seconds...")
                time.sleep(10)
                try:
                    vectorstore.add_documents(batch)
                except Exception as retry_e:
                    print(f"Retry failed: {retry_e}")

    print(f"Ingestion process finished. Data uploaded to Pinecone Index '{index_name}'.")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    ingest_docs()
