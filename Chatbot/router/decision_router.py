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

        # RAG Prompt
        rag_prompt = f"""
        SYSTEM INSTRUCTION:
        You are a caring, human-like member of the MindSettler Care Team.
        Answer the user's question based strictly on the Context provided below.
        
        Context:
        {context}
        
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
