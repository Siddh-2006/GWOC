from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import os
import time

load_dotenv()

def setup_index():
    api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME", "mindsettler-chatbot")
    
    if not api_key:
        print("❌ Error: PINECONE_API_KEY not found in .env")
        return

    pc = Pinecone(api_key=api_key)

    existing_indexes = [index.name for index in pc.list_indexes()]
    
    if index_name in existing_indexes:
        print(f"✅ Index '{index_name}' already exists.")
        index_info = pc.describe_index(index_name)
        print(f"   Status: {index_info.status['state']}")
        print(f"   Dimension: {index_info.dimension}")
        print(f"   Host: {index_info.host}")
    else:
        print(f"🚀 Creating index '{index_name}'...")
        try:
            pc.create_index(
                name=index_name,
                dimension=1536, # text-embedding-3-small
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
            print(f"✅ Index '{index_name}' creation initiated.")
            
            # Wait for it to be ready
            while not pc.describe_index(index_name).status['ready']:
                print("   Waiting for index to be ready...")
                time.sleep(2)
            
            print(f"🎉 Index '{index_name}' is ready!")
            
        except Exception as e:
            print(f"❌ Error creating index: {e}")

if __name__ == "__main__":
    setup_index()
