import os
from pymongo import MongoClient
import sys

client = None
db = None

def init_db():
    global client, db
    uri = os.getenv("MONGODB_URI")
    if not uri:
        print("CRITICAL: MONGODB_URI not set")
        return

    try:
        client = MongoClient(uri)
        # Verify connection
        client.admin.command('ping')
        print("Connected to MongoDB")
        
        # Select database (usually provided in URI or separate logic)
        # Assuming URI contains the DB name or we use a default
        db_name = uri.split("/")[-1].split("?")[0]
        if not db_name:
             # Fallback to 'test' as it contains the actual slots (47 found)
             db_name = "test"
        
        db = client[db_name]
        
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")

def get_db():
    global db
    if db is None:
        init_db()
    return db
