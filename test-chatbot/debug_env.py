import os
from dotenv import dotenv_values, load_dotenv

env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
print(f"Checking .env at: {env_path}")

if not os.path.exists(env_path):
    print("File does NOT exist.")
else:
    print(f"File exists. Size: {os.path.getsize(env_path)} bytes")
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            content = f.read()
            print("--- Content Preview (First 50 chars) ---")
            print(repr(content[:50]))
            print("--- End Preview ---")
    except Exception as e:
        print(f"Error reading file: {e}")

    print("Attempting dotenv_values...")
    try:
        config = dotenv_values(env_path)
        print(f"Keys found: {list(config.keys())}")
    except Exception as e:
        print(f"dotenv_values Parsing Error: {e}")
    
    print("Attempting load_dotenv...")
    loaded = load_dotenv(env_path)
    print(f"load_dotenv returned: {loaded}")
    print(f"GEMINI_API_KEY env var: {os.environ.get('GEMINI_API_KEY')}")
