# from .response_builder import format_text_response, format_data_response
from rag.retriever import retrieve_context
# from db.session_queries import get_available_slots, get_user_bookings
import os
import time
from utils.llm_factory import get_chat_model

def route_request(intent, message, user_context, chat_history=None):
    
    # 1. Handle Safety / Refusal
    if intent == "RESTRICTED_THERAPY_REQUEST":
        refusal_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts", "refusal_prompt.txt")
        try:
            with open(refusal_path, 'r') as f:
                refusal_msg = f.read().strip()
        except:
            refusal_msg = "<b>I am truly sorry you are in pain. Your safety is most important.</b> Please contact a local emergency helpline or visit the nearest hospital immediately."
        return {"type": "text", "content": refusal_msg, "isEmergency": True}

    # 2. Handle Auth Required
    if intent == "AUTH_REQUIRED":
         return {
             "type": "text", 
             "content": "Please log in to your MindSettler account to view your profile and manage your journey.",
             "actions": [{"label": "Login Now", "path": "/login", "primary": True}]
         }

    # Format Chat History for Prompt
    history_str = ""
    if chat_history:
        # Keep last 4 turns as requested
        recent_history = chat_history[-8:] # 4 user + 4 bot interactions
        for msg in recent_history:
            role = "User" if msg.get("role") == "user" else "Assistant"
            history_str += f"{role}: {msg.get('content')}\n"

    # Persona Base Instruction
    persona_instruction = """
    You are a caring, human-like member of the MindSettler Care Team. 
    Vibe: Warm, patient, and grounded—like a receptionist at a quiet studio.
    
    STRICT RULES:
    1. AVOID robotic phrases like "As an AI." Just be helpful.
    2. MAIN PURPOSE: Tell about MindSettler ONLY. 
    3. OUT-OF-SCOPE: If asked about things like 'driving a car' or 'cooking', answer briefly and politely, then say: "However, I'm specialized in guiding you through mental well-being and MindSettler's services. How can I help you with your journey today?"
    4. NO THERAPY: Never give diagnosis or medical advice. Validate emotions briefly, then pivot to MindSettler's support.
    5. HTML ONLY: Use <b>bold</b>, <ul><li>lists</li></ul>, and <p>paragraphs</p>. NO MARKDOWN.
    6. NO RAW PATHS: Do NOT include raw URLs or paths like "/booking" in your text response. Use only descriptive language. The system will provide buttons for navigation.
    """

    # 3. Handle Website Info / Founder / Content / Booking Process / Availability
    if intent in ["WEBSITE_INFO", "CONTENT_DISCOVERY", "FOUNDER_QUERY", "BOOKING_PROCESS", "SESSION_AVAILABILITY"]:
        print(f"[DEBUG] Processing Intent: {intent}")
        t0 = time.time()
        context = retrieve_context(message)
        print(f"[DEBUG] Retrieved Context: {context[:200]}..." if context else "[DEBUG] No Context Retrieved")
        t1 = time.time()
        print(f"[TIMING] RAG Retrieval took: {t1 - t0:.2f}s")
        
        llm = get_chat_model()
        if not llm:
            return {"type": "text", "content": "I'm experiencing high traffic. Please try again in a moment."}

        # Determine if we have enough context or should fall back
        if not context or len(context) < 30:
            print("[DEBUG] Insufficient context, falling back to LLM general knowledge.")
            # Use general prompt with MindSettler knowledge
            prompt = f"""
            {persona_instruction}
            
            Recent History:
            {history_str}
            
            User Question: {message}
            
            IMPORTANT: I don't have enough specific internal documents to answer this perfectly. 
            Politely acknowledge that I don't have the exact details on hand, but answer based on your general knowledge of MindSettler (Mental Well-being platform, Surat based, Online/Offline sessions) while maintaining the persona rules.
            """
        else:
            # RAG Prompt
            prompt = f"""
            {persona_instruction}

            USE THE CONTEXT BELOW to build your detailed answer. If the context doesn't fully answer the question, use your general caring persona to bridge the gap.

            Context: {context}
            
            Recent History:
            {history_str}

            User Question: {message}
            """
        
        try:
            response = llm.invoke(prompt)
            content = str(response.content)
            
            # Map intents to buttons
            actions = []
            if intent == "SESSION_AVAILABILITY" or intent == "BOOKING_PROCESS":
                actions.append({"label": "Book a Session", "path": "/booking", "primary": True})
            elif intent == "CONTENT_DISCOVERY":
                actions.append({"label": "Explore Library", "path": "/library", "primary": True})
            elif intent == "FOUNDER_QUERY":
                actions.append({"label": "About Founder", "path": "/about", "primary": False})
            
            # Add help button for most queries
            actions.append({"label": "Contact Support", "path": "/contact", "primary": False})

            return {"type": "text", "content": content, "actions": actions}
        except Exception as e:
            print(f"LLM RAG Error: {e}")
            return {"type": "text", "content": "I'm having trouble thinking right now. Please try again."}

    # 4. Handle Ambiguous / General Conversation
    print(f"[DEBUG] Handling Ambiguous/General Intent: {intent}")
    llm = get_chat_model()
    if not llm:
        return {"type": "text", "content": "I'm currently offline. Please check back later."}
        
    general_prompt = f"""
    {persona_instruction}

    The user said something that doesn't match our specific therapeutic topics or booking flow.
    Allow for natural conversation. Be brief and polite.
    If they ask about therapy, guide them to the booking page.
    
    Recent History:
    {history_str}

    User Message: {message}
    """
    try:
        response = llm.invoke(general_prompt)
        return {"type": "text", "content": response.content}
    except Exception as e:
        print(f"LLM General Error: {e}")
        return {"type": "text", "content": "I didn't quite catch that. Could you rephrase?"}

