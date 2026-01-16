# from .response_builder import format_text_response, format_data_response
from rag.retriever import retrieve_context
# from db.session_queries import get_available_slots, get_user_bookings
import os

def route_request(intent, message, user_context):
    
    # 1. Handle Safety / Refusal
    if intent == "RESTRICTED_THERAPY_REQUEST":
        refusal_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts", "refusal_prompt.txt")
        try:
            with open(refusal_path, 'r') as f:
                refusal_msg = f.read().strip()
        except:
            refusal_msg = "I can’t provide therapeutic or mental health advice."
        return {"type": "text", "content": refusal_msg}

    # 2. Handle Auth Required
    if intent == "AUTH_REQUIRED":
         return {"type": "text", "content": "Please log in to your MindSettler account to view your profile."}

    # 3. Handle Website Info / Founder / Content / Booking Process / Availability
    import time
    if intent in ["WEBSITE_INFO", "CONTENT_DISCOVERY", "FOUNDER_QUERY", "BOOKING_PROCESS", "SESSION_AVAILABILITY"]:
        
        t0 = time.time()
        context = retrieve_context(message)
        t1 = time.time()
        print(f"[TIMING] RAG Retrieval took: {t1 - t0:.2f}s")
        
        from utils.llm_factory import get_chat_model
        
        llm = get_chat_model()
        if llm:
            # RAG Prompt (Updated for enhanced detail and process focus)
            rag_prompt = f"""
            SYSTEM INSTRUCTION:
            You are a caring, human-like member of the MindSettler Care Team. You are the first touchpoint for users seeking mental health support.

            ### 1. CORE PERSONA & TONE
            - **Vibe:** Warm, patient, and grounded—like a receptionist at a quiet studio.
            - **Natural Language:** AVOID robotic phrases like "As an AI." Use phrases like "Our team," "We help you," and "I can guide you through..."
            - **The "Human" Boundary:** Never claim to be a human, but never apologize for being an AI. Just be helpful.

            ### 2. STRICT RULES (CRITICAL)
            - **PROCESS TRANSPARENCY:** When asked about booking, payments, or how things work, PROVIDE FULL DETAIL. Do not be brief with processes. Use numbered steps.
            - **REDIRECT LINKS:** Always provide a relevant markdown link (e.g., `[Book Now](/booking)`) when mentioning a feature or page so the user can navigate easily.
            - **Directness:** Answer the question first, then offer help. Don't fluff.
            - **No Diagnosis:** If a user expresses distress, validate them briefly ("I hear you..."), then pivot to booking or relevant platform features.

            ### 3. SAFETY PROTOCOL
            - **Emergency:** If a user mentions suicide/harm, **STOP**. Reply ONLY with: *"I am truly sorry you are in pain. Your safety is most important. Please contact a local emergency helpline or visit the nearest hospital immediately."*

            ### 4. KEY KNOWLEDGE (In case RAG is sparse)
            - **Online Sessions:** Payment is **MANDATORY** via UPI/Link before the session.
            - **Offline (In-Person):** You can pay via UPI in advance OR pay **Cash/UPI at the clinic**.
            - **Booking Flow:** 1. Select Slot -> 2. Fill Details -> 3. Admin Reviews -> 4. Payment Link Sent -> 5. Admin Confirms -> 6. Session Link/Address Sent.

            ### 5. CONTEXT USAGE
            Use the context below to answer. If the answer is not there, say you don't have that specific info but can help book a session.

            Context: {context}
            
            User Question: {message}
            """
            try:
                t2 = time.time()
                response = llm.invoke(rag_prompt)
                t3 = time.time()
                print(f"[TIMING] RAG Generation took: {t3 - t2:.2f}s")
                return {"type": "text", "content": response.content}
            except:
                pass

        if context:
            return {"type": "text", "content": f"Info from MindSettler:\n{context}"}
        else:
            return {"type": "text", "content": "I couldn't find specific information on that. I can help you book a session though."}

    # 4. Handle Ambiguous
    return {"type": "text", "content": "I'm not sure I understand. I can help you navigate the website or book a session."}
