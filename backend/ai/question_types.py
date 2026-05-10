QUESTION_TYPES = {
    "multiple_choice": "Multiple Choice",
    "fill_blank":      "Fill in the Blank",
    "true_false":      "True or False with Justification",
    "short_answer":    "Short Answer",
    "ordering":        "Ordering / Sequencing",
}


def get_question_type_instruction(question_type: str) -> str:
    instructions = {
        "multiple_choice": (
            "Write a multiple choice question with exactly 4 options labeled A), B), C), D) each on its own line. "
            "On a new line write: ANSWER (IN ENGLISH): followed by the correct letter only, e.g. B. "
            "ONLY the label 'ANSWER' must be in English; everything else follows the target language."
        ),
        "fill_blank": (
            "Write one sentence with a key word or phrase replaced by ___. "
            "On a new line write: ANSWER (IN ENGLISH): [the missing word or phrase]. "
            "ONLY the label 'ANSWER' must be in English."
        ),
        "true_false": (
            "Write a factual True or False statement. "
            "On a new line write: ANSWER (IN ENGLISH): True  or  ANSWER (IN ENGLISH): False. "
            "On a new line write: JUSTIFICATION (IN ENGLISH): [one sentence explaining why]. "
            "ONLY the labels 'ANSWER' and 'JUSTIFICATION' must be in English."
        ),
        "short_answer": (
            "Write an open-ended question requiring a 1-2 sentence response. "
            "On a new line write: ANSWER (IN ENGLISH): [a model answer]. "
            "ONLY the label 'ANSWER' must be in English."
        ),
        "ordering": (
            "List 4-5 steps or events in shuffled order, numbered 1 to 5. "
            "On a new line write: ANSWER (IN ENGLISH): [correct order as comma-separated numbers, e.g. 3,1,4,2]. "
            "ONLY the label 'ANSWER' must be in English."
        ),
    }
    return instructions.get(question_type, instructions["multiple_choice"])


# ── Preamble stripping ────────────────────────────────────────

_PREAMBLE_STARTS = (
    "based on", "here is", "here's", "the following",
    "question:", "below is", "given the lesson", "consider the",
    "for this", "using the", "from the lesson", "according to",
    "in the context", "this question", "let's test",
)


def _strip_preamble(lines: list) -> list:
    """Drop leading Granite preamble lines (intro phrases that echo the prompt)."""
    result = []
    for line in lines:
        stripped = line.strip()
        lower = stripped.lower()
        # Drop lines that are clearly intro text (end with ":" or match known openers)
        if any(lower.startswith(t) for t in _PREAMBLE_STARTS):
            if "?" not in line and "___" not in line:
                continue
        # Drop lines that are just a colon-terminated label with no real content
        if stripped.endswith(":") and len(stripped.split()) <= 8:
            continue
        result.append(line)
    return result


# ── Content extraction ────────────────────────────────────────

def _extract_question_content(lines: list, question_type: str) -> tuple:
    """
    Returns (question_text: str, extras: dict) where extras holds
    type-specific fields like options / items.
    """
    lines = [l for l in lines if l.strip()]  # drop blank lines

    if question_type == "multiple_choice":
        option_lines = [
            l for l in lines
            if l.strip() and l.strip()[0] in "ABCD" and ")" in l
        ]
        question_lines = [l for l in lines if l not in option_lines]
        question_lines = _strip_preamble(question_lines)
        return " ".join(question_lines).strip(), {"options": option_lines}

    if question_type == "ordering":
        item_lines = [
            l for l in lines
            if l.strip() and l.strip()[0].isdigit()
        ]
        question_lines = [l for l in lines if l not in item_lines]
        question_lines = _strip_preamble(question_lines)
        return " ".join(question_lines).strip(), {"items": item_lines}

    if question_type == "fill_blank":
        # Prefer the line that actually contains the blank
        blank_lines = [l for l in lines if "___" in l]
        if blank_lines:
            return blank_lines[0].strip(), {}
        question_lines = _strip_preamble(lines)
        return " ".join(question_lines).strip(), {}

    # short_answer, true_false
    question_lines = _strip_preamble(lines)
    return " ".join(question_lines).strip(), {}


# ── Main parser ───────────────────────────────────────────────

def parse_question_response(raw_response: str, question_type: str) -> dict:
    raw_response = raw_response.strip()
    lines = [l.rstrip() for l in raw_response.split("\n")]

    # Locate ANSWER line (case-insensitive)
    answer_idx = next(
        (i for i, l in enumerate(lines) if l.upper().startswith("ANSWER")),
        len(lines),
    )
    answer_line    = lines[answer_idx] if answer_idx < len(lines) else None
    correct_answer = answer_line.split(":", 1)[-1].strip() if answer_line else ""

    justification = None
    if question_type == "true_false":
        just_line = next(
            (l for l in lines if l.upper().startswith("JUSTIFICATION")), None
        )
        justification = just_line.split(":", 1)[-1].strip() if just_line else None

    pre_answer = lines[:answer_idx]
    question_text, extras = _extract_question_content(pre_answer, question_type)

    val = {
        "type":           question_type,
        "question":       question_text,
        "correct_answer": correct_answer,
    }
    if question_type == "multiple_choice":
        val["options"] = extras.get("options", [])
    if question_type == "ordering":
        val["items"] = extras.get("items", [])
    if question_type == "true_false":
        val["justification"] = justification

    return {QUESTION_TYPES.get(question_type, question_type): val}
