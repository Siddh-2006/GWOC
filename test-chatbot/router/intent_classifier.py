import sys
import os
# Add parent dir to path if not present (for standalone running)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.llm_factory import get_chat_model
from langchain_core.prompts import PromptTemplate

def classify_intent(message):
    
    # 0. Optmization: Keyword Shortcuts to skip LLM
    msg_lower = message.lower()
    
    # Booking Shortcuts
    if any(k in msg_lower for k in ["book", "schedule", "slot", "appointment", "availability"]):
        print("[OPTIMIZATION] Keyword 'Booking' detected. Skipping Intent LLM.")
        return "SESSION_AVAILABILITY"
        
    # Info Shortcuts
    if any(k in msg_lower for k in ["refund", "policy", "terms", "privacy", "about", "what is", "who is", "founder"]):
        print("[OPTIMIZATION] Keyword 'Info' detected. Skipping Intent LLM.")
        return "WEBSITE_INFO" # Maps to RAG flow anyway
        
    # Auth Shortcuts
    if any(k in msg_lower for k in ["login", "sign in", "profile", "logout"]):
        print("[OPTIMIZATION] Keyword 'Auth' detected. Skipping Intent LLM.")
        return "AUTH_REQUIRED"

    llm = get_chat_model()
    if not llm:
        return "AMBIGUOUS"
    
    template = """
    You are the Intent Classifier for the MindSettler chatbot.
    Your job is to map the user's message to exactly ONE of the following intents:
    
    1. WEBSITE_INFO: General questions, policies, refunds, privacy, "about us".
    2. CONTENT_DISCOVERY: Requesting articles, videos, resources, exercises.
    3. BOOKING_PROCESS: "How do I book?", "What is the process?".
    4. SESSION_AVAILABILITY: "Any slots?", "Book a session", "My bookings", "Check availability".
    5. FOUNDER_QUERY: Questions about Parnika (the founder).
    6. RESTRICTED_THERAPY_REQUEST: Asking for medical advice, diagnosis, or expressing crisis.
    7. AUTH_REQUIRED: "My profile", "Login".
    8. AMBIGUOUS: Garbage text, greetings with no context, or unclear requests.

    EXAMPLES:
    - "What is your refund policy?" -> WEBSITE_INFO
    - "Who is the founder?" -> FOUNDER_QUERY
    - "I want to book a slot" -> SESSION_AVAILABILITY
    - "Do you offer therapy?" -> WEBSITE_INFO (Clarification) OR RESTRICTED_THERAPY_REQUEST (if asking for it)
    - "I feel sad" -> RESTRICTED_THERAPY_REQUEST

    User Message: {message}
    
    Return ONLY the Intent Name (no extra text):
    """
    
    prompt = PromptTemplate(template=template, input_variables=["message"])
    chain = prompt | llm
    
    import time
    start_t = time.time()
    try:
        response = chain.invoke({"message": message})
        end_t = time.time()
        print(f"[TIMING] Intent Classification took: {end_t - start_t:.2f}s")
        intent = response.content.strip()
        print(f"[DEBUG] Raw Intent Response: '{intent}'")
        # Basic validation
        valid_intents = [
            "WEBSITE_INFO", "CONTENT_DISCOVERY", "SESSION_AVAILABILITY", 
            "BOOKING_PROCESS", "FOUNDER_QUERY", "RESTRICTED_THERAPY_REQUEST", 
            "AUTH_REQUIRED", "AMBIGUOUS"
        ]
        if intent not in valid_intents:
            return "AMBIGUOUS"
        return intent
    except Exception as e:
        print(f"Intent Classification Error: {e}")
        return "AMBIGUOUS"
