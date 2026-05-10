
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
    lang = SUPPORTED_LANGUAGES.get(language, language)
    return (
        f"You are a fast-paced educational tutor. "
        f"Always respond ENTIRELY in {lang}. Never switch languages, even for technical terms — find the native equivalent. "
        f"Keep all explanations under 80 words. "
        f"Use culturally relevant examples that resonate with {lang} speakers. Avoid Euro-centric defaults. "
        f"Do NOT translate — generate all content natively in {lang}."
    )


def build_curriculum_prompt(topic: str) -> str:
    return (
        f"Create a learning curriculum for the topic '{topic}'. "
        f"Break it into 6 to 8 progressive concept nodes that build on each other, from foundational to complex. "
        f"Return ONLY a valid JSON array — no markdown, no explanation, no extra text before or after. "
        f"Each object must have exactly these fields: "
        f'"id" (integer starting at 0), '
        f'"concept" (string, max 8 words in English), '
        f'"prerequisite" (the integer id this concept directly builds on, or null for the root). '
        f"Example of the required format: "
        f'[{{"id":0,"concept":"What light does for plants","prerequisite":null}},'
        f'{{"id":1,"concept":"Water and CO2 as inputs","prerequisite":0}},'
        f'{{"id":2,"concept":"Chlorophyll and leaf structure","prerequisite":1}}]'
    )


def build_flashcard_prompt(concept: str, topic: str, language: str) -> str:
    lang = SUPPORTED_LANGUAGES.get(language, language)
    return (
        f"Create a single flashcard for the concept '{concept}' within the topic '{topic}'. "
        f"Return ONLY a valid JSON object — no markdown, no extra text. "
        f"Fields: "
        f'"front" (a short punchy question or hook, max 12 words), '
        f'"back" (a clear direct answer, max 40 words), '
        f'"fact_tag" (exactly one of: "Key term", "Did you know", "Common misconception", "Real-world link"). '
        f"Write the front and back entirely in {lang}. "
        f'Example: {{"front":"What makes leaves green?","back":"Chlorophyll — a pigment that absorbs red and blue light, reflecting green back to our eyes.","fact_tag":"Key term"}}'
    )


def build_qa_prompt(question: str, concept: str, topic: str, language: str) -> str:
    lang = SUPPORTED_LANGUAGES.get(language, language)
    return (
        f"A student is learning about '{topic}', currently on the concept '{concept}'. "
        f"They ask: '{question}'. "
        f"Answer in 2–3 sentences. Stay focused on the topic context. Be direct and clear. Under 80 words total. "
        f"Respond entirely in {lang}."
    )


def build_lesson_prompt(
    topic: str,
    language: str,
    difficulty: int,
    concept: str = None,
) -> str:
    diff_label = DIFFICULTY_LABELS.get(difficulty, DIFFICULTY_LABELS[3])
    if concept:
        focus = (
            f"about '{concept}' and its role within '{topic}'. "
            f"Explain what it is, why it matters, and how it connects to the broader topic of '{topic}'"
        )
    else:
        focus = f"about '{topic}'"
    return (
        f"Write a {diff_label}-level lesson {focus}. "
        f"Keep it under 80 words. "
        f"End with exactly one sentence that leads naturally into a question, like 'Now let's test what you just learned.' "
        f"Write entirely in {language}."
    )


def build_challenge_prompt(
    topic: str,
    language: str,
    lesson_context: str,
    difficulty: int,
    question_type: str,
    concept: str = None,
) -> str:
    from ai.question_types import get_question_type_instruction

    diff_label      = DIFFICULTY_LABELS.get(difficulty, DIFFICULTY_LABELS[3])
    lang            = SUPPORTED_LANGUAGES.get(language, language)
    format_instruct = get_question_type_instruction(question_type)
    focus           = f"'{concept}'" if concept else f"'{topic}'"

    # Randomise the testing angle so repeated calls on the same node vary
    aspects = (
        "definition or purpose, cause and effect, real-world application, "
        "comparison with a related concept, or underlying mechanism"
    )

    return (
        f"You are testing a student's understanding of {focus} within the topic '{topic}'. "
        f"Write ONE {diff_label}-level question. "
        f"Choose a DIFFERENT angle each time — pick from: {aspects}. "
        f"Do NOT just rephrase the following lesson; use it only as background context: "
        f"'{lesson_context[:200]}'. "
        f"{format_instruct} "
        f"Write entirely in {lang}."
    )


def build_feedback_prompt(
    user_answer: str,
    correct_answer: str,
    language: str,
    is_correct: bool,
    topic: str,
) -> str:
    if is_correct:
        return (
            f"The learner answered correctly. "
            f"Give a short encouraging message (1 sentence) and one interesting follow-up fact about '{topic}'. "
            f"Under 60 words total. Respond entirely in {language}."
        )
    else:
        return (
            f"The learner answered: '{user_answer}'. "
            f"The correct answer is: '{correct_answer}'. "
            f"Explain in 1–2 sentences WHY the correct answer is right, in a supportive tone. "
            f"Under 60 words total. Respond entirely in {language}."
        )
