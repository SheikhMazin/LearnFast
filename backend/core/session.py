import uuid
from datetime import datetime, timezone
from core.difficulty import adjust_difficulty, calculate_confidence_score


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_session(language: str, topic: str, starting_difficulty: int = 2) -> dict:
    unique_id = str(uuid.uuid4())

    session_dict = {
            "session_id":           unique_id,
            "language":             language,
            "topic":                topic,
            "difficulty":           starting_difficulty,
            "streak":               0,
            "correctness_history":  [],     # list of bool - True = correct
            "time_history":         [],     # list of float - seconds per answer
            "avg_time_seconds":     0.0,
            "last_question_type":   None,
            "questions_answered":   0,
            "created_at":           _now_iso(),
            "last_updated_at":      _now_iso(),

    }

    return session_dict


def update_session(
    session: dict,
    is_correct: bool,
    time_taken_seconds: float,
    question_type: str,
) -> dict:

    session["correctness_history"].append(is_correct)
    session["time_history"].append(time_taken_seconds)
    session["avg_time_seconds"] = sum(session["time_history"]) / len(session["time_history"])
    
    if is_correct:
        session["streak"] += 1
    else:
        session["streak"] = 0

    session["questions_answered"] += 1
    session["last_question_type"] = question_type
    session["last_updated_at"] = _now_iso()

    session["difficulty"] = adjust_difficulty(session["difficulty"], session_stats_for_difficulty(session))
    return session

def session_stats_for_difficulty(session: dict) -> dict:
    return {
            "streak":               session["streak"],
            "correctness_history":  session["correctness_history"],
            "avg_time_seconds":     session["avg_time_seconds"]
            }



def get_session_stats(session: dict) -> dict:
    total_correct = sum(session["correctness_history"])
    questions_answered = session["questions_answered"]
    accuracy = total_correct / questions_answered if questions_answered > 0 else 0.0 
    confidence = calculate_confidence_score(
            session["streak"], 
            session["correctness_history"], 
            session["avg_time_seconds"]
        )

    return {
            "session_id":       session["session_id"],
            "questions_answered": questions_answered,
            "total_correct":      total_correct,
            "accuracy":           round(accuracy, 3),
            "current_streak":     session["streak"],
            "current_difficulty": session["difficulty"],
            "confidence_score":   round(confidence, 3),
            "avg_time_seconds":   round(session["avg_time_seconds"], 1),
    }


def reset_session(session: dict) -> dict:
    session["difficulty"]           = 2
    session["streak"]               = 0
    session["correctness_history"]  = []
    session["time_history"]         = []
    session["avg_time_seconds"]     = 0.0
    session["last_question_type"]   = None
    session["questions_answered"]   = 0
    session["last_updated_at"]      = _now_iso()

    return session
