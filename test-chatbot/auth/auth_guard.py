import jwt
import os
from functools import wraps
from flask import request, jsonify
from .user_context import UserContext

def authenticate_user(auth_header):
    """
    Decodes the JWT token and returns a UserContext object.
    If no token or invalid token, returns an unauthenticated UserContext.
    """
    if not auth_header or not auth_header.startswith("Bearer "):
        return UserContext(is_authenticated=False)

    token = auth_header.split(" ")[1]
    secret = os.getenv("JWT_ACCESS_SECRET")

    if not secret:
        # Log error or warning? For now, fail safe.
        print("WARNING: JWT_SECRET not set")
        return UserContext(is_authenticated=False)

    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return UserContext(
            is_authenticated=True,
            user_id=payload.get("id") or payload.get("userId") or payload.get("_id"),
            role=payload.get("role", "user")
        )
    except jwt.ExpiredSignatureError:
        return UserContext(is_authenticated=False)
    except jwt.InvalidTokenError:
        return UserContext(is_authenticated=False)
