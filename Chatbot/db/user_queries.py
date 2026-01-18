from .mongo_client import get_db
from bson import ObjectId

def get_user_profile(user_id):
    db = get_db()
    if db is None:
        return None
    try:
        # Based on Auth.model.js, the collection should be 'auths' (Mongoose default plural for 'Auth')
        # This collection contains the rich profile data (bio, gender, address, etc.)
        user = db.auths.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            # Fallback to 'users' collection if 'auths' doesn't have it (legacy/migration case)
            user = db.users.find_one({"_id": ObjectId(user_id)})
            
        if user:
            # Flatten/Format fields if needed
            # Auth model has firstName/lastName, User model has name. Match them.
            if 'firstName' in user:
                user['name'] = f"{user.get('firstName', '')} {user.get('lastName', '')}".strip()
            
            # Remove sensitive data
            user.pop("password", None)
            user.pop("password_hash", None)
            user.pop("refreshTokens", None)
            
            # Ensure _id is string
            user['_id'] = str(user['_id'])
            
        return user
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return None
