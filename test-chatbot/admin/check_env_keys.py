from dotenv import load_dotenv
import os

load_dotenv()

keys = [
    "OPENAI_API_KEY",
    "PINECONE_API_KEY", 
    "PINECONE_INDEX_NAME",
    "JWT_ACCESS_SECRET"
]

print("--- ENV CHECK ---")
for k in keys:
    val = os.getenv(k)
    if val:
        # Show first 3 chars to verify it's not empty/dummy
        print(f"✅ {k}: Found (Starts with {val[:4]}...)")
    else:
        print(f"❌ {k}: MISSING")
print("-----------------")
