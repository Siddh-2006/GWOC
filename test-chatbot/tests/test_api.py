import requests
import json
import time

BASE_URL = "http://127.0.0.1:5001"

def test_health():
    print("Testing /health endpoint...")
    try:
        r = requests.get(f"{BASE_URL}/test-chatbot/health")
        if r.status_code == 200:
            print("✅ Health Check Passed")
        else:
            print(f"❌ Health Check Failed: {r.status_code}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

def test_chat(message):
    print(f"\nTesting /chat with message: '{message}'...")
    url = f"{BASE_URL}/test-chatbot/chat"
    headers = {"Content-Type": "application/json"}
    payload = {"message": message}
    
    try:
        start = time.time()
        r = requests.post(url, json=payload, headers=headers)
        end = time.time()
        
        if r.status_code == 200:
            data = r.json()
            print(f"✅ Response ({r.elapsed.total_seconds():.2f}s): {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Chat Failed: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    print("⚠️  Ensure the Flask app is running (python app.py) before running this script.")
    test_chat("Hello")
    test_chat("What is the refund policy?")
    print("\n--- REPEATING QUERY TO TEST CACHE ---")
    test_chat("What is the refund policy?")
