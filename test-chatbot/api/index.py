from http.server import BaseHTTPRequestHandler
import os
import sys

# Add parent dir to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# Vercel Serverless Function Handler
def handler(request, response):
    return app(request, response)
