from http.server import BaseHTTPRequestHandler
import os
import sys

# Add parent dir to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Vercel Serverless Function Handler
def handler(request, response):
    try:
        from app import app
        return app(request, response)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        response.status_code = 200 # Return 200 so we see the message
        response.headers['Content-Type'] = 'text/plain'
        return response.send(f"CRITICAL STARTUP ERROR:\n{error_trace}")
