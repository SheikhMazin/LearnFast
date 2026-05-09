# Full display names used inside prompts — more explicit than bare language codes
SUPPORTED_LANGUAGES = {
    "English":    "English",
    "Spanish":    "Spanish (Español)",
    "French":     "French (Français)",
    "Mandarin":   "Mandarin Chinese (普通话)",
    "Arabic":     "Arabic (العربية)",
    "Hindi":      "Hindi (हिन्दी)",
    "Portuguese": "Portuguese (Português)",
    "Swahili":    "Swahili (Kiswahili)",
}

# Maps difficulty int to a label sent inside prompts
DIFFICULTY_LABELS = {
    1: "beginner",
    2: "elementary",
    3: "intermediate",
    4: "advanced",
    5: "expert",
}


def get_system_prompt(language: str) -> str:
    """
    Build the system prompt that locks Granite into the target language and tutor persona.

    What to do:
    - Look up language in SUPPORTED_LANGUAGES for the full display name.
      If not found, use the raw language string as fallback.
    - Return a single string that covers all five rules:
        1. Persona:   "You are a fast-paced educational tutor."
        2. Language:  "Always respond ENTIRELY in {display_name}. Never switch languages,
                       even for technical terms — find the native equivalent."
        3. Length:    "Keep all explanations under 80 words."
        4. Culture:   "Use culturally relevant examples that resonate with {display_name} speakers.
                       Avoid Euro-centric defaults."
        5. No mixing: "Do NOT translate — generate all content natively in {display_name}."

    Args:
        language: One of the keys in SUPPORTED_LANGUAGES (e.g. "Arabic")

    Returns:
        str: Complete system prompt string
    """
    pass


def build_lesson_prompt(topic: str, language: str, difficulty: int) -> str:
    """
    Build the user-turn prompt that asks Granite to generate a lesson explanation.

    What to do:
    - Look up difficulty in DIFFICULTY_LABELS (default "intermediate" if missing)
    - Return a prompt string that asks for:
        1. A concise lesson on {topic} written at {difficulty_label} level
        2. Strictly under 80 words
        3. End with one sentence that hooks naturally into a question
           (e.g. "Now let's test what you just learned.")
        4. Reminder: write entirely in {language}

    Args:
        topic:      Subject to teach (e.g. "fractions", "photosynthesis")
        language:   Target language string (passed to prompt for belt-and-suspenders reinforcement)
        difficulty: Int 1–5

    Returns:
        str: User-turn prompt for lesson generation
    """
    pass


def build_challenge_prompt(
    topic: str,
    language: str,
    lesson_context: str,
    difficulty: int,
    question_type: str,
) -> str:
    """
    Build the user-turn prompt that asks Granite to generate a challenge question.

    What to do:
    - Look up difficulty label from DIFFICULTY_LABELS
    - Import get_question_type_instruction from question_types.py and call it with question_type
      to get the format instruction (do this import inside the function to avoid circular imports)
    - Return a prompt that:
        1. Provides brief lesson context so Granite maintains continuity:
           "Based on this lesson: '{lesson_context[:200]}...'"
        2. Requests ONE question on {topic} at {difficulty_label} level
        3. Pastes the format instruction verbatim so Granite knows the exact output structure
        4. Includes ANSWER: on its own line so parse_question_response() can split on it
        5. Reminds: write entirely in {language}

    Args:
        topic:          Subject being tested
        language:       Target language
        lesson_context: The lesson text shown to the user (truncate to ~200 chars in the prompt)
        difficulty:     Int 1–5
        question_type:  One of "multiple_choice", "fill_blank", "true_false",
                        "short_answer", "ordering"

    Returns:
        str: User-turn prompt for challenge generation
    """
    pass


def build_feedback_prompt(
    user_answer: str,
    correct_answer: str,
    language: str,
    is_correct: bool,
    topic: str,
) -> str:
    """
    Build the user-turn prompt that asks Granite to generate answer feedback.

    What to do:
    - Return a prompt that branches on is_correct:

        If correct:
            "The learner answered correctly. Give a short encouraging message (1 sentence)
             and one interesting follow-up fact about {topic}. Under 60 words total."

        If incorrect:
            "The learner answered: '{user_answer}'.
             The correct answer is: '{correct_answer}'.
             Explain in 1–2 sentences WHY the correct answer is right, in a supportive tone.
             Under 60 words total."

    - Always end with: "Respond entirely in {language}."
    - Do NOT tell Granite to reveal that it is an AI — maintain the tutor persona.

    Args:
        user_answer:    What the user submitted
        correct_answer: The correct answer string (extracted by parse_question_response)
        language:       Target language
        is_correct:     Pre-computed by the backend — Granite is only asked to explain, not judge
        topic:          Topic for context

    Returns:
        str: User-turn prompt for feedback generation
    """
    pass
