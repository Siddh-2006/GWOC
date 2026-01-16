import requests
import json
import time

url = "https://gwoc-t7pn.onrender.com/chat"
headers = {"Content-Type": "application/json"}
data = {"message": "Hello! Who made you?"}

print(f"🤖 User: {data['message']}")
print(f"📨 Sending to: {url}...")

try:
    start = time.time()
    response = requests.post(url, headers=headers, json=data, timeout=30)
    end = time.time()
    
    if response.status_code == 200:
        res_json = response.json()
        print(f"✅ Success ({end - start:.2f}s)")
        print(f"🤖 Bot: {res_json.get('text', 'No text')}")
        print(f"📄 Full Response: {json.dumps(res_json, indent=2)}")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"Body: {response.text}")

except Exception as e:
    print(f"❌ Error: {e}")
