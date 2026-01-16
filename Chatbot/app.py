from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from auth.auth_guard import authenticate_user
from router.intent_classifier import classify_intent
from router.decision_router import route_request
from router.response_builder import build_response
from db.mongo_client import init_db

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize DB
# Initialize DB
# init_db()  <-- Commented out to prevent startup crash if Env is missing. Lazy load instead.

# Debug Route for Vercel 404s
@app.route('/debug-paths', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return jsonify({
        "status": "Flask Running - 404 Not Found",
        "requested_path": path,
        "base_url": request.base_url,
        "env_check": {
            "HF_HOME": os.environ.get("HF_HOME", "Not Set"),
            "OPENAI_KEY": "Set" if os.environ.get("OPENAI_API_KEY") else "Missing"
        }
    }), 404

@app.route('/')
def home():
    try:
        return render_template('index.html')
    except Exception as e:
        return f"MindSettler Chatbot API is Running! (Template Error: {e})", 200

@app.route('/test-chatbot/health', methods=['GET'])
@app.route('/health', methods=['GET']) # Alias
def health_check():
    return jsonify({"status": "healthy", "service": "MindSettler Chatbot"}), 200

from db.mongo_client import get_db
@app.route('/health/db', methods=['GET'])
def db_health_check():
    try:
        db = get_db()
        if db is not None:
             # Try a ping command
            db.command('ping')
            return jsonify({"status": "connected", "database": db.name}), 200
        else:
            return jsonify({"status": "disconnected", "error": "Init failed"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

from rag.ingest import ingest_text
@app.route('/admin/ingest', methods=['POST'])
def admin_ingest():
    # Basic Security Check (Optional: Add a SECRET_KEY header check here if needed)
    # auth_header = request.headers.get('x-admin-key')
    # if auth_header != os.getenv('ADMIN_SECRET', '12345'):
    #    return jsonify({"error": "Unauthorized"}), 401

    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No filename"}), 400
        content = file.read().decode('utf-8', errors='ignore')
        filename = file.filename
    else:
        content = request.form.get('text') or request.json.get('text')
        filename = request.form.get('filename') or request.json.get('filename') or "manual_entry.txt"
    
    if not content:
        return jsonify({"error": "No content provided"}), 400

    result = ingest_text(content, filename)
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@app.route('/test-chatbot/chat', methods=['POST'])
@app.route('/chat', methods=['POST']) # Alias
@app.route('/api/chat', methods=['POST']) # Alias (Standard Vercel)
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    # 1. Authenticate / Identify User
    auth_header = request.headers.get('Authorization')
    user_context = authenticate_user(auth_header)

    # 2. Classify Intent
    intent = classify_intent(user_message)

    # 3. Route & Execute Logic
    response_data = route_request(intent, user_message, user_context)

    # 4. Build Final Response
    return jsonify(build_response(response_data))

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    # Default to False for debug if not explicitly set to True
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
