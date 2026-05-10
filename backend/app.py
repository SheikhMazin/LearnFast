from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from core.session import create_session, update_session, reset_session, get_session_stats
from core.difficulty import select_question_type
from ai.generator import generate_lesson, generate_challenge, generate_feedback
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# In-memory session store — maps session_id (str) to session dict.
# Good enough for a hackathon demo. Replace with SQLite or Redis for persistence.
_sessions: dict = {}


@app.route("/")
def home():
    return jsonify({"status": "LearnFast backend running"})


LIST_OF_LANGUAGES = [
        "English", "Spanish", "French",
        "Mandarin", "Arabic", "Hindi",
        "Portuguese", "Swahili"
    ]

def get_current_user():
    """
    Extract and verify the JWT from the Authorization header.

    Called at the start of every protected route. Reads the Bearer token
    from the Authorization header, passes it to get_user() in db.py for
    Supabase verification, and returns the user object if valid.

    The expected header format is:
        Authorization: Bearer <access_token>

    If the header is missing, malformed, or the token is invalid/expired,
    returns None — the route should immediately return 401 in that case.

    Args:
        None — reads directly from Flask's request context

    Returns:
        Supabase UserResponse object if token is valid.
        None if header is missing, malformed, or token is invalid.

    Raises:
        Nothing — all failure cases return None
    """
    pass


@app.post("/session/start")
def session_start():
    """
    Start a new learning session.

    Expected JSON body: { "language": str, "topic": str, "difficulty": int (optional, default 2) }

    What to do:
    - Parse and validate the request body (return 400 if language or topic are missing)
    - Validate language is in the supported list (return 400 if not)
    - Validate difficulty is 1–5 (return 400 if out of range)
    - Call create_session(language, topic, difficulty) from core/session.py
    - Store the returned session dict in _sessions[session["session_id"]]
    - Return jsonify(session) with HTTP 201

    Returns:
        201: Full session dict (see SessionResponse in schemas.py)
        400: {"error": "..."} with validation message
    """
    data = request.get_json()
    list_of_languages = LIST_OF_LANGUAGES

    language = data["language"]
    topic = data["topic"]
    difficulty_level = data.get("difficulty", 2)    # default to 2 if not sent

    if not language or not topic:
        return jsonify({"success": False, "message": "Language and/or topic fields missing"}), 400
    
    if language not in list_of_languages:
        return jsonify({"success": False, "message": "Language not supported"}), 400

    if difficulty_level not in [1, 2, 3, 4, 5]:
        return jsonify({"success": False, "message": "Difficulty type not supported"}), 400

    session_dict = create_session(language, topic, difficulty_level) 
    _sessions[session_dict["session_id"]] = session_dict

    stats = get_session_stats(session_dict)

    return jsonify({
        "session_id":         session_dict["session_id"],
        "language":           session_dict["language"],
        "topic":              session_dict["topic"],
        "questions_answered": stats["questions_answered"],
        "total_correct":      stats["total_correct"],
        "accuracy":           stats["accuracy"],
        "current_streak":     stats["current_streak"],
        "current_difficulty": stats["current_difficulty"],
        "confidence_score":   stats["confidence_score"],
        "avg_time_seconds":   stats["avg_time_seconds"],
    }), 201


@app.post("/lesson")
def lesson():
    """
    Generate a lesson explanation in the target language.

    Expected JSON body: { "topic": str, "language": str, "session_id": str }

    What to do:
    - Parse body and look up session from _sessions using session_id (return 404 if not found)
    - Read difficulty from session["difficulty"] — do NOT trust a difficulty value from the request body
    - Call generate_lesson(topic, language, difficulty) from ai/generator.py
    - Return jsonify(result) with HTTP 200
    - On exception from generate_lesson: return {"error": str(e)}, 500

    Returns:
        200: { lesson, topic, language, difficulty }
        404: {"error": "Session not found"}
        500: {"error": "..."} on Granite/watsonx failure
    """
    data = request.get_json()
    session_id = data.get("session_id")
    session = _sessions.get(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404

    topic = data.get("topic", session["topic"])
    language = data.get("language", session["language"])
    difficulty = session["difficulty"]

    try:
        result = generate_lesson(topic, language, difficulty)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.post("/challenge")
def challenge():
    """
    Generate a challenge question based on the current lesson context.

    Expected JSON body: {
        "session_id":     str,
        "topic":          str,
        "language":       str,
        "lesson_context": str
    }

    What to do:
    - Look up session from _sessions (return 404 if missing)
    - Read difficulty from session["difficulty"]
    - Call select_question_type(difficulty, session["last_question_type"]) from core/difficulty.py
    - Call generate_challenge(topic, language, lesson_context, difficulty, question_type) from ai/generator.py
    - Return jsonify(result) with HTTP 200
    - On exception: return {"error": str(e)}, 500

    Returns:
        200: Structured question dict (shape varies by question_type — see question_types.py)
        404: {"error": "Session not found"}
        500: {"error": "..."} on Granite failure
    """
    
    data = request.get_json()
    seasion_id = data.get("session_id")
    session = _sessions.get(seasion_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404
    
    topic = data.get("topic", session["topic"])
    language = data.get("language", session["language"])
    difficulty = session["difficulty"]
    lesson_context = data.get("lesson_context", "")
    
    try:
        question_type = select_question_type(difficulty, session["last_question_type"])
        result = generate_challenge(topic, language, lesson_context, difficulty, question_type)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.post("/answer")
def answer():
    """
    Submit an answer, update session state, and return AI feedback.

    Expected JSON body: {
        "session_id":         str,
        "user_answer":        str,
        "correct_answer":     str,
        "question_type":      str,
        "time_taken_seconds": float
    }

    What to do:
    - Look up session from _sessions (return 404 if missing)
    - Determine is_correct:
        For "multiple_choice", "true_false", "fill_blank", "ordering":
            is_correct = user_answer.strip().lower() == correct_answer.strip().lower()
        For "short_answer":
            is_correct = True   # always mark correct; feedback is the real value here
            (You can add a smarter semantic check later if time allows)
    - Call update_session(session, is_correct, time_taken_seconds, question_type)
      from core/session.py — this also recalculates difficulty
    - Call generate_feedback(user_answer, correct_answer, language, is_correct, topic)
      from ai/generator.py — read language and topic from session dict
    - Merge session stats into the response using get_session_stats(session)
    - Return jsonify({
          "feedback":   feedback_dict["feedback"],
          "is_correct": is_correct,
          "language":   session["language"],
          "session":    stats_dict
      }) with HTTP 200
    - On exception from generate_feedback: return {"error": str(e)}, 500

    Returns:
        200: { feedback, is_correct, language, session: { ...stats } }
        404: {"error": "Session not found"}
        500: {"error": "..."} on Granite failure
    """
    data = request.get_json()
    session_id = data.get("session_id")
    session = _sessions.get(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404

    user_answer = data.get("user_answer", "")
    correct_answer = data.get("correct_answer", "")
    question_type = data.get("question_type", "")
    time_taken_seconds = data.get("time_taken_seconds", 0.0)

    if question_type == "short_answer":
        is_correct = True
    else:
        is_correct = user_answer.strip().lower() == correct_answer.strip().lower()

    update_session(session, is_correct, time_taken_seconds, question_type)

    try:
        feedback_dict = generate_feedback(user_answer, correct_answer, session["language"], is_correct, session["topic"])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    stats = get_session_stats(session)

    return jsonify({
        "feedback":   feedback_dict["feedback"],
        "is_correct": is_correct,
        "language":   session["language"],
        "session":    stats,
    }), 200


@app.get("/session/<session_id>/stats")
def session_stats(session_id: str):
    """
    Return current performance stats for a session (without generating any content).

    What to do:
    - Look up session_id in _sessions (return 404 if missing)
    - Call get_session_stats(session) from core/session.py
    - Return jsonify(stats) with HTTP 200

    Returns:
        200: Stats dict (see SessionResponse in schemas.py)
        404: {"error": "Session not found"}
    """
    session = _sessions.get(session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404
    
    stats = get_session_stats(session)

    return jsonify({
        "session_id":         session["session_id"],
        "language":           session["language"],
        "topic":              session["topic"],
        "questions_answered": stats["questions_answered"],
        "total_correct":      stats["total_correct"],
        "accuracy":           stats["accuracy"],
        "current_streak":     stats["current_streak"],
        "current_difficulty": stats["current_difficulty"],
        "confidence_score":   stats["confidence_score"],
        "avg_time_seconds":   stats["avg_time_seconds"],
    }), 200


    


@app.post("/session/<session_id>/reset")
def session_reset(session_id: str):
    """
    Reset a session's performance metrics (keeps language/topic/session_id).

    What to do:
    - Look up session in _sessions (return 404 if missing)
    - Call reset_session(session) from core/session.py
    - Return jsonify(session) with HTTP 200

    Returns:
        200: Reset session dict
        404: {"error": "Session not found"}
    """
    session = _sessions.get(session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    session = reset_session(session)

    _sessions[session_id] = session

    return jsonify(session), 200


@app.post("/auth/login")
def login():
    """
    Sign in an existing user and return a JWT token.

    Reads email and password from the request body, calls sign_in() from
    db.py, and returns the access_token and user_id. The frontend must
    store the access_token and send it in every subsequent request as:
        Authorization: Bearer <access_token>

    Wrap in try/except — if credentials are wrong, return 401.

    Request body:
        {
            "email": "user@example.com",
            "password": "theirpassword"
        }

    Returns:
        200: { "access_token": "...", "user_id": "..." }
        400: { "error": "Email and password required" } if fields missing
        401: { "error": "Invalid credentials" } if login fails
    """
    pass

@app.post("/auth/logout")
def logout():
    """
    Sign out the current user.

    Calls sign_out() from db.py which invalidates the session on
    Supabase's side. No request body needed — Supabase invalidates
    the current session automatically.

    Does NOT require authentication check — if the user is already
    logged out, signing out again is a no-op and should still return 200.

    Returns:
        200: { "message": "Logged out successfully" }
    """
    pass

@app.get("/session/<session_id>/history")
def session_history(session_id: str):
    """
    Return the full lesson history for a session, oldest first.

    Protected route — requires valid JWT in Authorization header.
    Looks up the session (memory first, then DB fallback), then calls
    get_history() from db.py to fetch all lesson, challenge, and feedback
    entries logged for this session.

    Args:
        session_id: UUID string from the URL path

    Returns:
        200: List of history entry dicts ordered chronologically.
             Returns empty list [] if no history yet — never 404 for
             empty history, only 404 if the session itself doesn't exist.
        401: { "error": "Unauthorized" } if JWT missing or invalid
        404: { "error": "Session not found" } if session_id doesn't exist
    """
    pass

if __name__ == "__main__":
    app.run(debug=True, port=5000)
