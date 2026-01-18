from .mongo_client import get_db
from bson import ObjectId
from datetime import datetime

def get_available_slots():
    db = get_db()
    if db is None:
        return []
    try:
        # Find slots where isAvailable is true and date >= now
        now = datetime.now()
        slots = list(db.slots.find({
            "isAvailable": True,
            "isBlocked": False,
            "date": {"$gte": now}
        }).sort("date", 1).limit(10))
        
        # Format for display
        formatted = []
        for s in slots:
            formatted.append({
                "id": str(s["_id"]),
                "date": s["date"].strftime("%Y-%m-%d"),
                "startTime": s["startTime"],
                "endTime": s["endTime"],
                "mode": s.get("availableModes", ["online"])
            })
        return formatted
    except Exception as e:
        print(f"Error fetching slots: {e}")
        return []

def get_user_bookings(user_id):
    db = get_db()
    if db is None:
        return []
    try:
        bookings = list(db.bookings.find({"userId": ObjectId(user_id)}).sort("createdAt", -1))
        formatted = []
        for b in bookings:
            formatted.append({
                "id": str(b["_id"]),
                "status": b["status"],
                "topic": b.get("sessionContent", {}).get("topics", "General"),
                "date": b.get("createdAt").strftime("%Y-%m-%d") # Ideally join with slot to get actual session date
            })
        return formatted
    except Exception as e:
        print(f"Error fetching bookings: {e}")
        return []
