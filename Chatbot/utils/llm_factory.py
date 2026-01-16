import os
from langchain_openai import ChatOpenAI

def get_chat_model():
    """
    Returns the ChatOpenAI instance.
    Uses 'gpt-4o-mini' as the default efficient model (comparable/better than Gemini Flash).
    Requires OPENAI_API_KEY in .env
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not set.")
        return None

    # Using gpt-4o-mini as it is the current cost-effective, high-speed standard
    return ChatOpenAI(
        model="gpt-4o-mini",
        openai_api_key=api_key,
        temperature=0,
        max_retries=2
    )
