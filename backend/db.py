import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in .env")

supabase: Client = create_client(url, key)

# ── Auth ──────────────────────────────────────────────

def sign_up(email: str, password: str): 
    """
    Register a new user account with Supabase Auth.

    Supabase handles all password hashing and storage internally —
    never store raw passwords yourself. By default, Supabase sends a
    confirmation email before the account is activated. For hackathon
    purposes you can disable email confirmation in Supabase dashboard
    under Authentication → Settings → Disable email confirmations.

    Args:
        email: The user's email address
        password: The user's chosen password (min 6 characters)

    Returns:
        dict with keys:
        - "user_id": UUID string of the newly created user
        - "email": the user's email
        Returns None if signup failed silently (e.g. email already exists
        but Supabase is configured not to reveal that)

    Raises:
        Exception: If email is already registered or password is too short
    """
    return supabase.auth.sign_up({"email": email, "password": password})


def sign_in(email: str, password: str):
    """
    Sign in an existing user and return a session with JWT token.

    The returned session contains an access_token (JWT) that the frontend
    must store and send with every subsequent request in the Authorization
    header as: 'Bearer <access_token>'. This token expires after 1 hour
    but Supabase handles refresh automatically on the frontend.

    Args:
        email: The user's email address
        password: The user's password

    Returns:
        dict with keys:
        - "access_token": JWT string to send with every request
        - "refresh_token": string used to get new access tokens
        - "user_id": UUID string identifying this user

    Raises:
        Exception: If credentials are wrong or account doesn't exist
    """
    return supabase.auth.sign_in_with_password({"email": email, "password": password})


def sign_out() -> None:
    """
    Invalidate the current user's session on Supabase's side.

    After sign out, the JWT token becomes invalid and any request using
    it will be rejected. The frontend should also clear the stored token
    from localStorage or wherever it's kept.

    Args:
        jwt: The user's current access token from the Authorization header

    Returns:
        None

    Raises:
        Exception: If the token is already invalid or expired
    """
    supabase.auth.sign_out()

def get_user(jwt: str) -> object | None:
    """
    Verify a JWT token and return the authenticated user.

    This is the core of route protection — call this at the start of any
    protected Flask route to confirm the request is from a real logged-in
    user. If it returns None, respond with 401 Unauthorized immediately.

    What to do:
    - Call supabase.auth.get_user(jwt)
    - If it succeeds, return the user object
    - Wrap in try/except — if the token is expired or tampered with,
      Supabase will raise an exception. Catch it and return None.
      Never let the exception propagate to the route — always return None.

    Args:
        jwt: The Bearer token extracted from the Authorization header

    Returns:
        Supabase UserResponse object if token is valid — access the user
        id via return_value.user.id. Returns None if invalid or expired.

    Raises:
        Nothing — all exceptions are caught and converted to None return
    """
    try:
        response = supabase.auth.get_user(jwt)
    except Exception:
        return None

    return response

# ── Sessions ──────────────────────────────────────────

def save_session(session: dict, user_id: str) -> None:
    """
    Insert or update a session record in the Supabase sessions table.

    Uses upsert so this same function handles both creating a new session
    and updating an existing one — no need for separate insert/update calls.
    The session dict from core/session.py is stored as a JSONB blob in the
    'data' column so the full session state is preserved without needing
    a column for every field.

    What to do:
    - Call supabase.table("sessions").upsert({...}).execute()
    - Include session_id, user_id, language, topic, data (full session dict),
      and last_updated_at in the upsert payload

    Args:
        session: The full session dict from core/session.py
        user_id: UUID string of the authenticated user (from get_user())

    Returns:
        None

    Raises:
        Exception: If the DB write fails — propagate as-is to the route handler
    """

    supabase.table("sessions").upsert({
        "session_id":     session["session_id"],
        "user_id":        user_id,
        "language":       session["language"],
        "topic":          session["topic"],
        "data":           session,
        "last_updated_at": session["last_updated_at"]
    }).execute()


def load_session(session_id: str) -> dict | None:
    """
    Load a session dict from Supabase by session_id.

    Used as a fallback when a session isn't in the in-memory _sessions
    dict — for example after a server restart. If found, the returned dict
    should be stored back into _sessions so subsequent requests hit memory.

    What to do:
    - Query sessions table for the row matching session_id
    - Use .single() so it returns one row or raises if none found
    - Extract and return result.data["data"] (the full session dict)
    - Wrap in try/except — return None if not found

    Args:
        session_id: UUID string of the session to load

    Returns:
        Full session dict if found, None if session doesn't exist

    Raises:
        Nothing — missing sessions return None, not an exception
    """
    try:
        response = (
                supabase.table("sessions")
                .select("*")
                .eq("session_id", session_id)
                .single()
                .execute()
            )
    except Exception:
        return None

    return response.data["data"] if response.data else None

def delete_session(session_id: str) -> None:
    """
    Permanently delete a session and its data from Supabase.

    Note: This does NOT delete the associated lesson_history rows —
    those are kept for analytics even after a session ends. If you want
    to delete history too, call that separately or add CASCADE in SQL.

    What to do:
    - Call supabase.table("sessions").delete().eq("session_id", session_id).execute()

    Args:
        session_id: UUID string of the session to delete

    Returns:
        None

    Raises:
        Exception: If the DB delete fails — propagate as-is
    """
    supabase.table("sessions").delete().eq("session_id", session_id).execute()


# ── Lesson History ────────────────────────────────────

def save_lesson(session_id: str, user_id: str, type: str, language: str, topic: str, difficulty: int, content: dict) -> None:
    """
    Append a generated lesson, challenge, or feedback entry to lesson_history.

    Every time the AI generates content, log it here. This builds a full
    record of what the user was taught and how they performed — useful for
    the demo to show learning progression, and for the SDG pitch (we can
    show how many lessons have been delivered in each language).

    The 'type' field distinguishes between the three kinds of content:
    - 'lesson'    → the explanation generated by /lesson route
    - 'challenge' → the question generated by /challenge route
    - 'feedback'  → the feedback generated by /answer route

    What to do:
    - Call supabase.table("lesson_history").insert({...}).execute()
    - Store session_id, user_id, type, language, topic, difficulty, and
      content (the full generated dict) as JSONB

    Args:
        session_id: UUID string linking this entry to a session
        user_id: UUID string of the authenticated user
        type: One of 'lesson', 'challenge', or 'feedback'
        language: Language the content was generated in (e.g. "Spanish")
        topic: Topic that was taught (e.g. "fractions")
        difficulty: Difficulty level 1-5 at time of generation
        content: The full generated content dict from generator.py

    Returns:
        None

    Raises:
        Exception: If the DB write fails — propagate as-is
    """
    supabase.table("lesson_history").insert({
        "session_id":   session_id,
        "user_id":      user_id,
        "type":         type,
        "language":     language,
        "topic":        topic,
        "difficulty":   difficulty,
        "content":      content
        }).execute()

def get_user_sessions(user_id: str) -> list:
    """Return all sessions for a user, newest first, with summary stats."""
    try:
        response = (
            supabase.table("sessions")
            .select("session_id, topic, language, last_updated_at, data")
            .eq("user_id", user_id)
            .order("last_updated_at", desc=True)
            .limit(30)
            .execute()
        )
        results = []
        for r in (response.data or []):
            d = r.get("data") or {}
            results.append({
                "session_id":         r["session_id"],
                "topic":              r["topic"],
                "language":           r["language"],
                "last_updated_at":    r["last_updated_at"],
                "questions_answered": d.get("questions_answered", 0),
                "current_node":       d.get("current_node", 0),
                "total_nodes":        len(d.get("curriculum", [])),
            })
        return results
    except Exception:
        return []


def get_history(session_id: str) -> list:
    """
    Return all lesson history entries for a given session, oldest first.

    Used by GET /session/<session_id>/history to show the frontend a
    full record of what was taught. The frontend can use this to render
    a lesson recap, show performance over time, or highlight progress.

    What to do:
    - Query lesson_history where session_id matches
    - Order by created_at ascending (oldest first = chronological order)
    - Return result.data, or empty list [] if nothing found

    Args:
        session_id: UUID string of the session to fetch history for

    Returns:
        list of dicts, each containing:
        - "type": 'lesson', 'challenge', or 'feedback'
        - "language": language content was generated in
        - "topic": topic that was taught
        - "difficulty": difficulty level at time of generation
        - "content": the full generated content dict
        - "created_at": ISO timestamp string
        Returns [] if no history exists — never None.

    Raises:
        Nothing — missing history returns [], not an exception
    """
    try:
        response = (
                supabase.table("lesson_history")
                .select("*")
                .eq("session_id", session_id)
                .order("created_at")
                .execute()
                )
    except Exception:
        return []

    return response.data or []
