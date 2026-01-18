from langchain_openai import ChatOpenAI
from langchain_core.tools import create_retriever_tool
from langchain_pinecone import PineconeVectorStore
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import create_react_agent
from rag.embeddings import get_embeddings
from tools import check_available_slots, get_current_user_info
import os
from dotenv import load_dotenv

load_dotenv()

def get_agent_graph():
    # 1. Setup LLM
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    # 2. Setup Tools
    embeddings = get_embeddings()
    index_name = os.getenv("PINECONE_INDEX_NAME")
    if not index_name:
        raise ValueError("PINECONE_INDEX_NAME not found in .env")
        
    vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)
    retriever = vectorstore.as_retriever()
    
    knowledge_base_tool = create_retriever_tool(
        retriever,
        "search_mindsettler_knowledge",
        "Search for information about MindSettler services, mission, policies, and general questions. Always use this first for general queries."
    )

    tools = [knowledge_base_tool, check_available_slots, get_current_user_info]

    # 3. Create Agent (LangGraph)
    # Using 'prompt' instead of 'state_modifier' as per current version signature
    
    base_system_prompt = """You are the MindSettler AI Assistant, a caring and professional guide.

YOUR RESPONSIBILITIES:
1. Guide users through MindSettler services using the knowledge base.
2. Help users book sessions by checking available slots when asked.
3. Encourage users to take their first session if they seem hesitant.
4. Use the provided user_id to fetch user details if needed: {user_id}

CRITICAL FORMATTING RULES (HTML ONLY):
- You MUST return responses in HTML format.
- DO NOT use Markdown (no **, #, or [links](...)).
- Use <b>text</b> for bold text. Use this for key information like user names, session dates, and main titles.
- Use <ul><li>item</li></ul> for lists. Ensure there is NO extra space between list items.
- Use <br> for single line breaks. Use two <br><br> ONLY when starting a new paragraph.
- AVOID extra white space or blank lines between HTML tags.
- ALWAYS link the booking page when mentioning it.
- **MANDATORY**: All links MUST have this inline style: <a href="..." style="color: #Dd1764; font-weight: bold;">Link Text</a>.
- Example: "Hello <b>John</b>!<br>Your next session is on <b>October 24th</b>."

CRITICAL BEHAVIOR RULES:
- DO NOT give psychological or medical advice. If asked "psycho-questions" (e.g., "I feel depressed, what should I do?", "How to cure anxiety?"), you MUST refuse politely and redirect them to book a session with a professional or visit the contact page for deeper help.
- Redirect to the booking page (/booking) or contact page (/contact) when action is required.
- Be warm, empathetic, but professional.

Use the available tools to answer questions."""

    # Pass system prompt via the 'prompt' argument (which accepts a string as system message)
    graph = create_react_agent(llm, tools=tools, prompt=base_system_prompt)
    return graph
