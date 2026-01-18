from langchain_core.tools import tool
from db.session_queries import get_available_slots
from db.user_queries import get_user_profile

@tool
def check_available_slots():
    """
    Fetches the list of available therapy session slots for the upcoming days.
    Returns JSON list of slots with date, time, and mode.
    Use this when a user asks about availability or wants to book a session.
    """
    return get_available_slots()

@tool
def get_current_user_info(user_id: str):
    """
    Fetches the profile details of the currently signed-in user given their User ID.
    Returns user name, email, and preferences.
    Use this to personalize the conversation if the user is authenticated.
    """
    profile = get_user_profile(user_id)
    if profile:
        # Sanitize sensitive info
        profile.pop("password", None)
        profile.pop("password_hash", None)
        return str(profile)
    return "User not found."
