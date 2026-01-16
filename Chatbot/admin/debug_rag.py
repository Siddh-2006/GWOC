import sys
import os
# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import textwrap

# Setup path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from rag.retriever import retrieve_context
from langchain_google_genai import ChatGoogleGenerativeAI
from router.intent_classifier import classify_intent

def print_step(title, content):
    print("\n" + "="*50)
    print(f"🔹 {title}")
    print("="*50)
    print(textwrap.fill(str(content), width=80))

def run_debug_flow(user_query):
    print("\n🚀 STARTING DEBUG FLOW FOR QUERY:", f'"{user_query}"')
    
    # 1. Intent
    print_step("STEP 1: INTENT CLASSIFICATION", "Analyzing user intent...")
    intent = classify_intent(user_query)
    print(f"Detected Intent: {intent}")

    if intent not in ["WEBSITE_INFO", "CONTENT_DISCOVERY", "FOUNDER_QUERY", "BOOKING_PROCESS"]:
        print("\n⚠️  Intent classified as AMBIGUOUS (or non-RAG).")
        print("   -> FORCING RAG FLOW FOR VISUALIZATION...")
        # Continue execution despite intent mismatch
    else:
        print("✅ Intent matches RAG category. Proceeding...")

    # 2. Retrieval
    print_step("STEP 2: RETRIEVING CONTEXT (RAG)", "Searching Pinecone for relevant chunks...")
    context = retrieve_context(user_query)
    
    if not context:
        print("❌ No relevant context found in Vector DB.")
        return

    print("✅ Context Found!")
    print("\n--- RETRIEVED CHUNKS ---\n")
    print(context)
    print("\n------------------------")

    # 3. Prompt Construction
    print_step("STEP 3: CONSTRUCTING PROMPT", "Merging Context + User Question...")
    
    rag_prompt = f"""
    You are the MindSettler assistant. Use the context below to answer the user's question.
    If the answer is not in the context, say "I don't have that information."
    
    Context: {context}
    
    User Question: {user_query}
    """
    print(rag_prompt)

    # 4. LLM Generation
    print_step("STEP 4: SENDING TO LLM (GEMINI)", "Waiting for response...")
    
    # 4. LLM Generation
    print_step("STEP 4: SENDING TO LLM (GEMINI)", "Waiting for response...")
    
    from utils.llm_factory import get_chat_model
    llm = get_chat_model()
    
    if not llm:
        print("❌ Error: Could not initialize LLM.")
        return
        
    try:
        response = llm.invoke(rag_prompt)
        print_step("STEP 5: FINAL RESPONSE", response.content)
    except Exception as e:
        print(f"❌ LLM Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = "What is the refund policy?"
    
    run_debug_flow(query)
