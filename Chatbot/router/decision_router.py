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
        
        if llm:
            # RAG Prompt (Updated for maximum detail and structured response)
            rag_prompt = f"""
            SYSTEM INSTRUCTION:
            You are a senior member of the MindSettler Care Team. You are the definitive guide for users seeking support.

            ### 1. CORE PERSONA & TONE
            - **Vibe:** Professional, warm, and extremely thorough—like a senior coordinator at a high-end wellness center.
            - **Natural Language:** AVOID robotic self-references. Use personal pronouns like "We," "Our team," and "I will help you..."
            - **Confidence:** Speak with authority about our processes.

            ### 2. RESPONSE STRUCTURE (MANDATORY)
            - **BE EXPLICITLY DETAILED:** Do NOT be brief. Users want "proper explanations with paragraphs."
            - **Structure:** 
                1. Start with a welcoming, supportive opening paragraph.
                2. Use numbered lists for all processes (Booking, Payments, etc.).
                3. Use separate paragraphs for different features (Reflection, Journey).
                4. End with a supportive call to action and a relevant link.
            - **REDIRECT LINKS:** Every response MUST include at least one relevant link in markdown format (e.g., `[Book Now](/booking)`).

            ### 3. STRICT RULES
            - **PROCESS TRANSPARENCY:** When asked "how" something works, explain the user's journey from start to finish (Selection -> Info -> Review -> Payment -> Confirmation).
            - **Directness:** Answer the core question in the very first sentence, then expand into the detailed process.
            - **No Diagnosis:** Validate briefly ("I understand this is difficult..."), but focus on providing institutional/platform support.

            ### 4. SAFETY PROTOCOL
            - **Emergency:** If a user mentions suicide/harm, **STOP**. Reply ONLY with: *"I am truly sorry you are in pain. Your safety is most important. Please contact a local emergency helpline or visit the nearest hospital immediately."*

            ### 5. KEY INSTITUTIONAL KNOWLEDGE
            - **Online Sessions:** Payment is **MANDATORY** via UPI/Link before the session to confirm the slot.
            - **Offline (In-Person):** You can pay via UPI in advance OR pay **Cash/UPI at the clinic**.
            - **Booking Workflow:** 
                1. Select Slot from the [Booking Page](/booking).
                2. Fill Details (Name, Contact, Mode).
                3. Admin reviews the request (Pending status).
                4. You receive a Payment Link/UPI ID once approved.
                5. Admin confirms after payment verification.
                6. Final email with GMeet link or Studio Address is sent.

            ### 6. CONTEXT USAGE
            Use the context below to build your detailed answer. Synthesize the information into a cohesive, helpful, multi-paragraph response.

            Context: {context}
            
            User Question: {message}
            """
            try:
                t2 = time.time()
                response = llm.invoke(rag_prompt)
                t3 = time.time()
                print(f"[TIMING] RAG Generation took: {t3 - t2:.2f}s")
                return {"type": "text", "content": response.content}
            except Exception as e:
                print(f"LLM Error: {e}")
                pass

        if context:
            return {"type": "text", "content": f"Info from MindSettler:\n{context}"}
        else:
            return {"type": "text", "content": "I couldn't find specific information on that. I can help you book a session though."}

    # 4. Handle Ambiguous
    return {"type": "text", "content": "I'm not sure I understand. I can help you navigate the website or book a session."}
