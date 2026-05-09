import uuid
from datetime import datetime, timezone


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_session(language: str, topic: str, starting_difficulty: int = 2) -> dict:
    """
    Create and return a fresh session state dict.

    What to do:
    - Generate a unique ID: str(uuid.uuid4())
    - Build and return this dict:
        {
            "session_id":         <uuid string>,
            "language":           language,
            "topic":              topic,
            "difficulty":         starting_difficulty,
            "streak":             0,
            "correctness_history": [],   # list of bool — True = correct
            "time_history":        [],   # list of float — seconds per answer
            "avg_time_seconds":    0.0,
            "last_question_type":  None,
            "questions_answered":  0,
            "created_at":          _now_iso(),
            "last_updated_at":     _now_iso(),
        }

    Args:
        language:           Target language for this session (e.g. "Arabic")
        topic:              Subject being studied (e.g. "photosynthesis")
        starting_difficulty: Initial difficulty level — default 2 (elementary)

    Returns:
        dict: Fresh session state
    """
    pass


def update_session(
    session: dict,
    is_correct: bool,
    time_taken_seconds: float,
    question_type: str,
) -> dict:
    """
    Update session state after the user answers one question, then recalculate difficulty.

    What to do (in order):
    1. Append is_correct to session["correctness_history"]
    2. Append time_taken_seconds to session["time_history"]
    3. Recalculate avg_time_seconds:
           session["avg_time_seconds"] = sum(time_history) / len(time_history)
    4. Update streak:
           If is_correct:  session["streak"] += 1
           Else:           session["streak"] = 0
    5. Increment session["questions_answered"] by 1
    6. Set session["last_question_type"] = question_type
    7. Update session["last_updated_at"] = _now_iso()
    8. Call adjust_difficulty() from difficulty.py:
           from backend.core.difficulty import adjust_difficulty
           session["difficulty"] = adjust_difficulty(session["difficulty"], session_stats_for_difficulty(session))
       Where session_stats_for_difficulty returns:
           {"streak": session["streak"], "correctness_history": session["correctness_history"],
            "avg_time_seconds": session["avg_time_seconds"]}
    9. Return session

    Args:
        session:            The current session dict (mutated in place)
        is_correct:         Whether the user's answer was correct
        time_taken_seconds: Seconds the user took to answer
        question_type:      The question type that was just answered

    Returns:
        dict: Updated session (same object, mutated)
    """
    pass


def get_session_stats(session: dict) -> dict:
    """
    Return a summary of the session's current performance.

    What to do:
    - total_correct = sum(session["correctness_history"])
    - questions_answered = session["questions_answered"]
    - accuracy = total_correct / questions_answered if questions_answered > 0 else 0.0
    - Call calculate_confidence_score() from difficulty.py:
        from backend.core.difficulty import calculate_confidence_score
        confidence = calculate_confidence_score(
            session["streak"],
            session["correctness_history"],
            session["avg_time_seconds"]
        )
    - Return:
        {
            "session_id":         session["session_id"],
            "questions_answered": questions_answered,
            "total_correct":      total_correct,
            "accuracy":           round(accuracy, 3),
            "current_streak":     session["streak"],
            "current_difficulty": session["difficulty"],
            "confidence_score":   round(confidence, 3),
            "avg_time_seconds":   round(session["avg_time_seconds"], 1),
        }

    Args:
        session: The current session dict

    Returns:
        dict: Stats summary (safe to send directly to the frontend)
    """
    pass


def reset_session(session: dict) -> dict:
    """
    Clear all performance metrics while keeping the session identity and preferences.

    What to do:
    - Preserve: session_id, language, topic, created_at
    - Reset all metrics to initial values:
        difficulty        = 2
        streak            = 0
        correctness_history = []
        time_history        = []
        avg_time_seconds    = 0.0
        last_question_type  = None
        questions_answered  = 0
        last_updated_at     = _now_iso()
    - Return the mutated session dict

    Use case: user clicks "Start Over" without creating a brand-new session.

    Args:
        session: The session to reset

    Returns:
        dict: Same session dict with metrics cleared
    """
    pass
