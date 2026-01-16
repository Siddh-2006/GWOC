# from .response_builder import format_text_response, format_data_response
from rag.retriever import retrieve_context
# from db.session_queries import get_available_slots, get_user_bookings
import os
import time
from utils.llm_factory import get_chat_model

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

        # RAG Prompt (Updated with User's Preferred Template + Process Detail)
        # RAG Prompt (Updated with User's Preferred Template + Process Detail)
        rag_prompt = f"""
        SYSTEM INSTRUCTION:
        You are a caring, human-like member of the MindSettler Care Team. You are the definitive guide for users seeking support.

        ### 1. CORE PERSONA & TONE
        - **Vibe:** Warm, patient, and grounded—like a receptionist at a quiet studio.
        - **Natural Language:** AVOID robotic phrases like "As an AI." Use phrases like "Our team," "We help you," and "I can guide you through..."
        - **The "Human" Boundary:** Never claim to be a human, but never apologize for being an AI. Just be helpful.

        ### 2. RESPONSE STRUCTURE & FORMATTING (CRITICAL: HTML ONLY)
        - **ABSOLUTELY NO MARKDOWN.** Do NOT use `**bold**`, `*italic*`, or `# headers`.
        - **USE HTML TAGS ONLY:**
            - Use `<b>text</b>` for bold text.
            - Use `<ul><li>item</li></ul>` for lists.
            - Use `<p>` for paragraphs.
            - Use `<a href="/booking">Link Text</a>` for links.
        - **CONVERT CONTEXT:** The context provided below contains Markdown. You MUST convert it to HTML in your response (e.g., change `**Slot**` to `<b>Slot</b>`).

        ### 3. THE BOOKING JOURNEY (MANDATORY DETAIL)
        1. <b>Select Slot</b>: Choose a Date and Time on the <a href="/booking">Booking Page</a>.
        2. <b>Fill Details</b>: Enter Name, Contact, and choose Session Mode (Online/Offline).
        3. <b>Payment</b>:
            - <b>Online Sessions</b>: You MUST make the payment (UPI) to confirm the booking.
            - <b>Offline Sessions</b>: You can pay Online or pay <b>Cash/UPI at the clinic</b>.
        4. <b>Confirmation</b>: You will receive an email confirmation once the booking is verified.

        ### 4. PLATFORM LOGISTICS
        - <b>Login Rules:</b> Login is <b>ONLY</b> required for <b>Booking</b> and <b>Liking Content</b>. Viewing resources is free.
        - <b>My Journey:</b> A visual timeline in the [Profile](/profile) (updated by the therapist).
        - <b>Cancellations:</b> Contact Admin at +91 99746 31313. No auto-cancellations.

        ### 5. SAFETY PROTOCOL
        - If a user mentions suicide/harm, **STOP**. Reply ONLY with: *"I am truly sorry you are in pain. Your safety is most important. Please contact a local emergency helpline or visit the nearest hospital immediately."*

        ### 6. CONTEXT USAGE
        Use the context below from the knowledge base to build your detailed answer.

        Context: {context}
        
        User Question: {message}
        """
        
        try:
            response = llm.invoke(rag_prompt)
            try:
                print(f"[DEBUG] LLM Response Content: {response.content}", flush=True)
            except Exception:
                pass
            return {"type": "text", "content": str(response.content)}
        except Exception as e:
            try:
                print(f"LLM RAG Error: {e}", flush=True)
            except:
                pass
            return {"type": "text", "content": "I'm having trouble thinking right now. Please try again."}

    # 4. Handle Ambiguous / General Conversation (No RAG)
    print(f"[DEBUG] Handling Ambiguous/General Intent: {intent}")
    llm = get_chat_model()
    if not llm:
        return {"type": "text", "content": "I'm currently offline. Please check back later."}
        
    general_prompt = f"""
    You are a friendly, helpful assistant for MindSettler.
    The user said something that doesn't match our specific therapeutic topics or booking flow.
    Just allow for natural conversation. be brief and polite.
    If they ask about therapy, guide them to the booking page.
    
    User Message: {message}
    """
    try:
        response = llm.invoke(general_prompt)
        return {"type": "text", "content": response.content}
    except Exception as e:
        print(f"LLM General Error: {e}")
        return {"type": "text", "content": "I didn't quite catch that. Could you rephrase?"}
