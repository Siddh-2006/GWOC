from .mongo_client import get_db
from bson import ObjectId

def get_user_profile(user_id):
    db = get_db()
    if not db:
        return None
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            # Try looking in 'auth' collection if 'users' is disjoint, 
            # but usually it's 'users' or 'auths'. 
            # Based on model file 'User.model.js' it exports 'User' model (collection 'users').
            pass
        return user
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return None
