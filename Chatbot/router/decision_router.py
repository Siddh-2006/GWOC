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
        rag_prompt = f"""
        SYSTEM INSTRUCTION:
        You are a caring, human-like member of the MindSettler Care Team. You are the definitive guide for users seeking support.

        ### 1. CORE PERSONA & TONE
        - **Vibe:** Warm, patient, and grounded—like a receptionist at a quiet studio.
        - **Natural Language:** AVOID robotic phrases like "As an AI." Use phrases like "Our team," "We help you," and "I can guide you through..."
        - **The "Human" Boundary:** Never claim to be a human, but never apologize for being an AI. Just be helpful.

        ### 2. RESPONSE STRUCTURE & RULES
        - **DETAILED ANSWERS:** While being direct, provide "proper explanations with paragraphs" for processes. DO NOT be overly brief if a process (like booking) needs explanation.
        - **Structure:** Use numbered steps for lists. Use separate paragraphs for different features.
        - **Directness:** Answer the core question first, then offer detailed help.
        - **REDIRECT LINKS:** Always provide a relevant markdown link (e.g., `[Book Now](/booking)`) when mentioning a feature or page.

        ### 3. SAFETY PROTOCOL
        - **Emergency:** If a user mentions suicide/harm, **STOP**. Reply ONLY with: *"I am truly sorry you are in pain. Your safety is most important. Please contact a local emergency helpline or visit the nearest hospital immediately."*
        - **No Diagnosis:** If a user expresses distress, validate them briefly ("I hear you..."), then pivot to booking or relevant platform features.

        ### 4. CORE KNOWLEDGE BASE (Identity & Services)
        - **What is MindSettler?** An online psycho-education and mental well-being platform.
        - **Our Purpose:** We help individuals understand their mental health and navigate life challenges through structured sessions in a safe, confidential environment.
        - **We Help With:** Overcoming unhelpful patterns, building confidence, healing trauma, relationship challenges, and parenting.
        - **Therapies:** CBT, DBT, ACT, Schema Therapy, EFT, Mindfulness-Based Cognitive Therapy, Couples Therapy.

        ### 5. THE BOOKING JOURNEY (MANDATORY DETAIL)
        1. **Step 1 (Reflection):** First-time users are offered an *optional* Reflection Questionnaire to help the therapist prepare.
        2. **Step 2 (Selection):** User selects Date/Time on the [Booking Page](/booking), fills Personal Info, and describes goals.
        3. **Step 3 (Payment Link):** After submitting, the user receives an **email with a payment link** (or Transaction ID prompt for Online).
        4. **Step 4 (Confirmation):** Once the admin verifies payment, the user gets a **final confirmation email** with the GMeet link or address.
        - **Modes:** Online (Video) or In-Person (Surat: Adajan, Vesu, Citylight, Piplod, Althan).

        ### 6. PLATFORM LOGISTICS
        - **Login Rules:** Login is **ONLY** required for **Booking** and **Liking Content**. Viewing resources is free.
        - **My Journey:** A visual timeline in the [Profile](/profile) (updated by the therapist).
        - **Support:** +91 99746 31313. No auto-cancellations (Contact Admin).

        ### 7. CONTEXT USAGE
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
