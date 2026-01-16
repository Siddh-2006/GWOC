# MindSettler Platform Processes

This document outlines the internal workflows and features of the MindSettler platform. Use this to explain how the system works to users.

## 1. Corporate & Institutional Inquiries
MindSettler offers services for organizations. The intake process is separate from individual booking.
*   **Engagement Types**:
    *   **Workplace Workshops**: Mental health sessions for employees.
    *   **Institutional Psycho-Education**: Educational programs for schools/colleges.
    *   **Event-Based Sessions**: One-off sessions for specific events.
    *   **Community Programs**: Large scale community outreach.
*   **Process**:
    1.  Organization fills the **Corporate Inquiry Form**.
    2.  Required Details: Organization Name, Contact Person, Email, Engagement Type.
    3.  Status Flow: New -> In-Discussion -> Confirmed -> Closed.
    4.  All inquiries are handled manually by the Admin team.

## 2. Reflection System (Self-Analysis)
Users can engage in guided self-reflection sessions before booking.
*   **Purpose**: Helps the user articulate feelings and helps the therapist prepare for a session.
*   **Workflow**:
    1.  User starts a **Reflection Session**.
    2.  System presents key questions.
    3.  User answers (or skips).
    4.  **AI Analysis**: The system generates a summary, identifies "Key Themes" (e.g., Anxiety, Work Stress), and suggests "Possible Approaches" (e.g., CBT, ACT).
    5.  **Status**: Active -> Completed (or Abandoned).
    6.  **Integration**: Completed reflection summaries are visible to the Admin/Therapist when reviewing a booking.

## 3. User Journey (Journaling & Progress)
The "Journey" feature acts as a persistent record of the user's mental health progress.
*   **Entry Types**:
    *   **Milestone**: Major breakthrough.
    *   **Session Summary**: Notes after a therapy session.
    *   **Reflection**: Personal thoughts.
    *   **Goal**: Setting and tracking specific objectives.
*   **Functionality**:
    *   Users can track **Mood Before** and **Mood After** an event/session.
    *   **Goals**: Can be marked as "Completed" with specific dates.
    *   **Visibility**: Entries can be Private or Shared with the therapist.

## 4. Admin Capabilities
The Admin Panel is the control center for MindSettler.
*   **Session Management**:
    *   **Review**: Mark pending bookings as "Under Review".
    *   **Approve**: Send payment link/request to user.
    *   **Confirm**: detailed confirmation after payment (Date, Time, GMeet Link).
    *   **Reject**: With a specific reason.
*   **Slot Management**: Create, Block, or Delete time slots for Online/Offline availability.
*   **RAG Knowledge Base**: Admins can "Feed the Brain" by uploading text/files directly to update the Chatbot's knowledge.
