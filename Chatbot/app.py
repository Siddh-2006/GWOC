from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
from agent import get_agent_graph
from langchain_core.messages import HumanMessage, SystemMessage
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per day", "30 per hour"],
    storage_uri="memory://",
)

# Initialize Agent
try:
    agent_graph = get_agent_graph()
    print("Agent Graph initialized successfully.")
except Exception as e:
    print(f"Error initializing agent: {e}")
    agent_graph = None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "TEST_CHATBOT"})

@app.route('/test-chatbot/chat', methods=['POST'])
@app.route('/chat', methods=['POST'])
@limiter.limit("30 per 15 minutes")
def chat():
    if not agent_graph:
        return jsonify({"error": "Agent not initialized"}), 500
        
    data = request.json
    user_message = data.get('message', '')
    user_id = data.get('user_id', 'Guest')
    user_context = data.get('user_context', '')
    
    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    try:
        # Construct system context with user info
        system_content = f"Current User ID: {user_id}"
        if user_context:
            system_content += f"\n\nUser Profile & Data Context:\n{user_context}"
        
        messages = [
            SystemMessage(content=system_content),
            HumanMessage(content=user_message)
        ]
        
        # Invoke LangGraph
        response = agent_graph.invoke({"messages": messages})
        
        # Extract final response (last AI message)
        final_message = response["messages"][-1]
        output_text = final_message.content

        return jsonify({
            "text": output_text,
            "type": "text"
        })
    except Exception as e:
        print(f"Error processing chat: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)
