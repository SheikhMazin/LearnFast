import random

DIFFICULTY_MIN = 1
DIFFICULTY_MAX = 5

DIFFICULTY_LABELS = {
    1: "beginner",
    2: "elementary",
    3: "intermediate",
    4: "advanced",
    5: "expert",
}

# Which question types are appropriate at each difficulty.
# Lower difficulty → simpler formats (true/false, MC). Higher → open-ended.
DIFFICULTY_QUESTION_TYPES = {
    1: ["true_false", "multiple_choice"],
    2: ["multiple_choice", "fill_blank"],
    3: ["multiple_choice", "fill_blank", "short_answer"],
    4: ["fill_blank", "short_answer", "ordering"],
    5: ["short_answer", "ordering"],
}


def calculate_confidence_score(
    streak: int,
    correctness_history: list,
    avg_time_seconds: float,
) -> float:
    
    """
    Args:
        streak:             Current consecutive correct answer count
        correctness_history: List of bools in chronological order (True = correct)
        avg_time_seconds:   Average seconds the user takes per answer this session

    Returns:
        float: Confidence score 0.0–1.0
    """
    
    recent = correctness_history[-5:]
    acc = sum(recent) / max(len(recent), 1)
    
    streak_bonus = min(streak * 0.1, 0.3)
    
    time_factor = 1.0 if avg_time_seconds < 15 else 0.8 if avg_time_seconds < 60 else 0.6
    
    score = min(acc * time_factor + streak_bonus, 1.0)
    
    return score

    


def adjust_difficulty(current_difficulty: int, session_stats: dict) -> int:
    """
    Core adaptive algorithm — decide whether to raise, lower, or hold difficulty.

    What to do:
    - Extract from session_stats:
        streak              = session_stats["streak"]
        correctness_history = session_stats["correctness_history"]
        avg_time_seconds    = session_stats["avg_time_seconds"]
    - Call calculate_confidence_score(streak, correctness_history, avg_time_seconds)
    - Apply rules in order:
        1. IF confidence >= 0.8 AND streak >= 3:
               new_difficulty = min(current_difficulty + 1, DIFFICULTY_MAX)
        2. ELIF confidence <= 0.4 OR (len(correctness_history) >= 3 AND
                                      not any(correctness_history[-3:])):
               new_difficulty = max(current_difficulty - 1, DIFFICULTY_MIN)
        3. ELSE:
               new_difficulty = current_difficulty  (hold)
    - Return new_difficulty

    Args:
        current_difficulty: Current level (1–5)
        session_stats:      Dict with keys: streak (int), correctness_history (list[bool]),
                            avg_time_seconds (float)

    Returns:
        int: New difficulty level (1–5)
    """
    
    streak = session_stats["streak"]
    chist = session_stats["correctness_history"]
    avTimeS = session_stats["avg_time_seconds"]
    confidence = calculate_confidence_score(streak, chist, avTimeS)
    
    if confidence >= 0.8 and streak >= 3:
        new_diff = min(current_difficulty + 1, DIFFICULTY_MAX)
    elif confidence <= 0.4 or (len(chist) >= 3 and not any(chist[-3:])):
        new_diff = max(current_difficulty - 1, DIFFICULTY_MIN)
    else:
        new_diff = current_difficulty
        
    return new_diff


def select_question_type(difficulty: int, last_question_type: str = None) -> str:
    """
    Pick the next question type based on difficulty, avoiding immediate repeats.

    What to do:
    - Get the allowed types for this difficulty from DIFFICULTY_QUESTION_TYPES.
      Fallback to ["multiple_choice"] if difficulty is out of range.
    - If last_question_type is in the allowed list AND there is more than one option,
      remove it from the candidate list to avoid repeating the same type twice in a row.
    - Return random.choice(candidates)

    Args:
        difficulty:         Current difficulty level (1–5)
        last_question_type: The question_type used in the previous question, or None

    Returns:
        str: A question type key (e.g. "fill_blank")
    """
    
    candidates = DIFFICULTY_QUESTION_TYPES[difficulty].copy()
    
    candidates.remove(last_question_type)
    
    return random.choice(candidates)


def get_difficulty_label(difficulty: int) -> str:
    """
    Return the human-readable label for a difficulty int.

    What to do:
    - Return DIFFICULTY_LABELS.get(difficulty, "intermediate")

    Args:
        difficulty: Int 1–5

    Returns:
        str: Label like "beginner", "advanced", etc.
    """
    
    return DIFFICULTY_LABELS.get(difficulty, "intermediate")
    pass
