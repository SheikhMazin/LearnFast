from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from core.session import create_session, update_session, reset_session, get_session_stats
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

    if language not in [1, 2, 3, 4, 5]:
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
    pass


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
    pass


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
    pass


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




if __name__ == "__main__":
    app.run(debug=True, port=5000)
