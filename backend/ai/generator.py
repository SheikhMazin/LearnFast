import json
import re

from ai.client import call_granite
from ai.prompts import (
    get_system_prompt,
    build_curriculum_prompt,
    build_lesson_prompt,
    build_challenge_prompt,
    build_feedback_prompt,
    build_flashcard_prompt,
    build_qa_prompt,
)
from ai.question_types import parse_question_response


# ── Curriculum ────────────────────────────────────────────────

def generate_curriculum(topic: str, language: str) -> list:
    """
    Ask Granite to produce a 6–8 node concept graph for the topic.
    Returns a list of dicts: [{id, concept, prerequisite, status}, ...]
    Falls back to a single-node curriculum if parsing fails.
    """
    system_prompt = (
        "You are a curriculum designer. "
        "Respond ONLY with a valid JSON array. No markdown, no explanation, no extra text."
    )
    user_prompt = build_curriculum_prompt(topic)
    raw = call_granite(system_prompt, user_prompt, max_tokens=600)

    nodes = _parse_json_list(raw)

    if not nodes:
        # Graceful fallback — one node so the session still works
        nodes = [{"id": 0, "concept": topic, "prerequisite": None}]

    # Attach status field used by the frontend
    for i, node in enumerate(nodes):
        node["id"]     = i                          # re-index defensively
        node["status"] = "in_progress" if i == 0 else "locked"

    return nodes


def _parse_json_list(raw: str) -> list:
    """Try several strategies to extract a JSON array from Granite output."""
    raw = raw.strip()

    # Strip markdown code fences
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()

    # Direct parse
    try:
        result = json.loads(raw)
        if isinstance(result, list):
            return result
    except json.JSONDecodeError:
        pass

    # Find the first [...] block
    match = re.search(r"\[.*\]", raw, re.DOTALL)
    if match:
        try:
            result = json.loads(match.group())
            if isinstance(result, list):
                return result
        except json.JSONDecodeError:
            pass

    return []


def _parse_json_dict(raw: str) -> dict:
    """Try several strategies to extract a JSON object from Granite output."""
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()

    try:
        result = json.loads(raw)
        if isinstance(result, dict):
            return result
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        try:
            result = json.loads(match.group())
            if isinstance(result, dict):
                return result
        except json.JSONDecodeError:
            pass

    return {}


# ── Lesson ────────────────────────────────────────────────────

def generate_lesson(
    topic: str,
    language: str,
    difficulty: int,
    concept: str = None,
) -> dict:
    system_prompt = get_system_prompt(language)
    user_prompt   = build_lesson_prompt(topic, language, difficulty, concept=concept)
    lesson_text   = call_granite(system_prompt, user_prompt)

    return {
        "lesson":    lesson_text,
        "topic":     topic,
        "concept":   concept or topic,
        "language":  language,
        "difficulty": difficulty,
    }


# ── Challenge ─────────────────────────────────────────────────

def generate_challenge(
    topic: str,
    language: str,
    lesson_context: str,
    difficulty: int,
    question_type: str,
    concept: str = None,
) -> dict:
    system_prompt = get_system_prompt(language)
    user_prompt   = build_challenge_prompt(
        topic, language, lesson_context, difficulty, question_type, concept=concept
    )
    raw_text = call_granite(system_prompt, user_prompt, max_tokens=500)
    return parse_question_response(raw_text, question_type)


# ── Feedback ──────────────────────────────────────────────────

def generate_feedback(
    user_answer: str,
    correct_answer: str,
    language: str,
    is_correct: bool,
    topic: str,
) -> dict:
    system_prompt = get_system_prompt(language)
    user_prompt   = build_feedback_prompt(
        user_answer, correct_answer, language, is_correct, topic
    )
    raw_text = call_granite(system_prompt, user_prompt, max_tokens=200)
    return {"feedback": raw_text, "is_correct": is_correct, "language": language}


# ── Flashcard ─────────────────────────────────────────────────

def generate_flashcard(concept: str, topic: str, language: str) -> dict:
    """
    Returns a flashcard dict: { front, back, fact_tag, concept, language }
    Falls back gracefully if JSON parsing fails.
    """
    system_prompt = get_system_prompt(language)
    user_prompt   = build_flashcard_prompt(concept, topic, language)
    raw           = call_granite(system_prompt, user_prompt, max_tokens=200)

    card = _parse_json_dict(raw)

    if not card.get("front") or not card.get("back"):
        # Fallback: treat raw output as the back of the card
        card = {
            "front":    f"What is '{concept}'?",
            "back":     raw[:300].strip(),
            "fact_tag": "Key term",
        }

    card["concept"]  = concept
    card["topic"]    = topic
    card["language"] = language
    card["type"]     = "flashcard"
    return card


# ── Semantic answer checking ──────────────────────────────────

def check_answer_semantic(
    user_answer: str,
    correct_answer: str,
    language: str,
) -> bool:
    """
    Ask Granite whether user_answer is semantically equivalent to correct_answer.
    Used for fill_blank and short_answer where exact string matching is too strict.
    Falls back to False on any AI or network error.
    """
    system_prompt = (
        "You are a strict answer evaluator. "
        "Reply with ONLY the single word CORRECT or INCORRECT — no punctuation, no explanation."
    )
    user_prompt = (
        f"Model answer: '{correct_answer}'\n"
        f"Student's answer: '{user_answer}'\n"
        f"Is the student's answer semantically correct or equivalent to the model answer? "
        f"Accept synonyms, minor spelling variations, and answers that are partially correct "
        f"but convey the core idea. "
        f"Reply with only CORRECT or INCORRECT."
    )
    try:
        raw = call_granite(system_prompt, user_prompt, max_tokens=10)
        return raw.strip().upper().startswith("CORRECT")
    except Exception:
        return False


# ── Q&A ───────────────────────────────────────────────────────

def generate_qa(
    question: str,
    concept: str,
    topic: str,
    language: str,
) -> dict:
    system_prompt = get_system_prompt(language)
    user_prompt   = build_qa_prompt(question, concept, topic, language)
    answer        = call_granite(system_prompt, user_prompt, max_tokens=200)

    return {
        "type":            "qa",
        "user_question":   question,
        "answer":          answer,
        "concept_context": concept,
        "language":        language,
    }
