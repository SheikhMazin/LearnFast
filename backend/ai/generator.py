from backend.ai.client import call_granite
from backend.ai.prompts import get_system_prompt, build_lesson_prompt, build_challenge_prompt, build_feedback_prompt
from backend.ai.question_types import parse_question_response


def generate_lesson(topic: str, language: str, difficulty: int) -> dict:
    """
    Generate a lesson explanation and return it as a dict.

    What to do:
    - Call get_system_prompt(language) → system_prompt
    - Call build_lesson_prompt(topic, language, difficulty) → user_prompt
    - Call call_granite(system_prompt, user_prompt, max_tokens=400) → raw_text
    - Return:
        {
            "lesson":     raw_text,
            "topic":      topic,
            "language":   language,
            "difficulty": difficulty,
        }

    Args:
        topic:      Subject to teach (e.g. "fractions")
        language:   Target language string (e.g. "Spanish")
        difficulty: Int 1–5

    Returns:
        dict with keys: lesson, topic, language, difficulty

    Raises:
        Exception: propagated from call_granite — caught by the Flask route handler
    """
    pass


def generate_challenge(
    topic: str,
    language: str,
    lesson_context: str,
    difficulty: int,
    question_type: str,
) -> dict:
    """
    Generate a challenge question and return it as a structured dict.

    What to do:
    - Call get_system_prompt(language) → system_prompt
    - Call build_challenge_prompt(topic, language, lesson_context, difficulty, question_type) → user_prompt
    - Call call_granite(system_prompt, user_prompt, max_tokens=500) → raw_text
    - Call parse_question_response(raw_text, question_type) → structured dict
    - Return the structured dict from parse_question_response
      (it already contains "type", "question", "correct_answer", and type-specific fields)

    Args:
        topic:          Subject being tested
        language:       Target language
        lesson_context: The lesson text that was shown to the user this round
        difficulty:     Int 1–5
        question_type:  One of "multiple_choice", "fill_blank", "true_false",
                        "short_answer", "ordering"

    Returns:
        dict: Structured question — exact shape depends on question_type (see question_types.py)
    """
    pass


def generate_feedback(
    user_answer: str,
    correct_answer: str,
    language: str,
    is_correct: bool,
    topic: str,
) -> dict:
    """
    Generate feedback on the user's answer and return it as a dict.

    What to do:
    - Call get_system_prompt(language) → system_prompt
    - Call build_feedback_prompt(user_answer, correct_answer, language, is_correct, topic) → user_prompt
    - Call call_granite(system_prompt, user_prompt, max_tokens=200) → raw_text
    - Return:
        {
            "feedback":   raw_text,
            "is_correct": is_correct,
            "language":   language,
        }

    Note: is_correct is determined by the backend (session.py), NOT by Granite.
    Granite only generates the explanation text — it never decides if the answer is right.

    Args:
        user_answer:    What the user submitted
        correct_answer: The correct answer from the question dict
        language:       Target language
        is_correct:     Pre-computed correctness flag
        topic:          Topic for feedback context

    Returns:
        dict with keys: feedback, is_correct, language
    """
    pass
