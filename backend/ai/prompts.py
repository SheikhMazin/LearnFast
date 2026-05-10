
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



def build_lesson_prompt(topic: str, language: str, difficulty: int) -> str:
    
    difficulty = DIFFICULTY_LABELS.get(difficulty, DIFFICULTY_LABELS.get(3))
    
    return (
      f"Write a {difficulty}-level lesson explaining '{topic}' in {language}. "
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
) -> str:
    from backend.ai.question_types import get_question_type_instruction
    
    
    difficulty = DIFFICULTY_LABELS.get(difficulty, DIFFICULTY_LABELS.get(3))
    language = SUPPORTED_LANGUAGES.get(language, language)
    
    format_instruct = get_question_type_instruction(question_type)
    
    return (
      f"Based on this lesson: '{lesson_context[:200]}...' "
      f"Write ONE {difficulty}-level question about'{topic}'. "
      f"{format_instruct} "
      f"Write entirely in {language}."
  )
    pass


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
      
