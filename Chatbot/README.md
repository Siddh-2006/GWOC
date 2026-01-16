# MindSettler Chatbot Service

A standalone Python-based chatbot service for MindSettler using RAG and MongoDB.

## Setup

1.  **Navigate to directory**:
    ```bash
    cd test-chatbot
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Setup**:
    - Copy `.env.example` to `.env`.
    - Fill in `MONGODB_URI` (from backend), `JWT_ACCESS_SECRET` (from backend), and `GEMINI_API_KEY`.

4.  **Ingest Knowledge Base**:
    - Add your `.txt` or `.md` content files to `data/`.
    - Run:
    ```bash
    python admin/upload_docs.py
    ```

5.  **Run Service**:
    ```bash
    python app.py
    ```
    Service runs on `http://localhost:5001`.

## Endpoints

-   `POST /test-chatbot/chat`
    -   Headers: `Authorization: Bearer <token>` (Optional)
    -   Body: `{"message": "Hello"}`

## Architecture

-   **Auth**: JWT verification sharing secret with main backend.
-   **Database**: Direct MongoDB connection for live slot/availability checks.
-   **RAG**: ChromaDB + Google Gemini Embeddings for static content.
-   **Router**: LLM-based intent classification + Decision Router.
