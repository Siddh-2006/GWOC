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

    # 3. Handle Session/Booking (STATIC NOW)
    if intent == "SESSION_AVAILABILITY":
        return {
            "type": "text", 
            "content": "To check availability or book a session, please visit our Booking Page or contact Parnika directly."
        }


    # 4. Handle Website Info / Founder / Content
    import time
    if intent in ["WEBSITE_INFO", "CONTENT_DISCOVERY", "FOUNDER_QUERY", "BOOKING_PROCESS"]:
        
        t0 = time.time()
        context = retrieve_context(message)
        t1 = time.time()
        print(f"[TIMING] RAG Retrieval took: {t1 - t0:.2f}s")
        
        # Here we would ideally pass context + message to the LLM to generate a natural answer.
        # For this implementation, I will just return the context or a simple generated answer.
        # Let's do a simple generation if possible, else return context.
        # (Generating answer requires another LLM call - I will add that to response_builder or here)
        
        from utils.llm_factory import get_chat_model
        
        llm = get_chat_model()
        if llm:
            # RAG Prompt
            rag_prompt = f"""
            You are the MindSettler assistant. Use the context below to answer the user's question.
            If the answer is not in the context, say "I don't have that information."
            
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

    # 5. Default / Ambiguous
    return {"type": "text", "content": "I'm not sure I understand. I can help you navigate the website or book a session."}
