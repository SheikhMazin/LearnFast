# Question type keys — these strings flow through the entire system
# (prompts → generator → session → frontend)
QUESTION_TYPES = {
    "multiple_choice": "Multiple Choice",
    "fill_blank":      "Fill in the Blank",
    "true_false":      "True or False with Justification",
    "short_answer":    "Short Answer",
    "ordering":        "Ordering / Sequencing",
}


def get_question_type_instruction(question_type: str) -> str:
    
    q_type = QUESTION_TYPES.get(question_type, question_type)
    
    
    instructions = {
      "multiple_choice": (
          "Write a multiple choice question with exactly 4 options labeled A, B, C, D. separate each option with newline."
          "On a new line write: ANSWER (IN ENGLISH): followed by the correct letter only,  e.g. B"
          "ONLY the label \"ANSWER\" MUST be in ENGLISH ALWAYS, the rest of the string follows the selected language"
          
      ),
      "fill_blank": (
          "Write one sentence with a key word or phrase replaced by ___. "
          "On a new line write: ANSWER (IN ENGLISH): [the missing word or phrase]"
          "ONLY the label \"ANSWER\" MUST be in ENGLISH ALWAYS, the rest of the string follows the selected language"
          
      ),
      "true_false": (
          "Write a factual True or False statement. "
          "On a new line write: ANSWER (IN ENGLISH): [True or False] "
          "On a new line write: JUSTIFICATION (IN ENGLISH): [one sentence explaining why]"
          "ONLY the labels \"JUSTIFICATION\" and \"ANSWER\" MUST be in ENGLISH ALWAYS, the rest of the string follows the selected language"
      ),
      "short_answer": (
          "Write an open-ended question requiring a 1–2 sentence response. "
          "On a new line write: ANSWER (IN ENGLISH): [a model answer]"
          "ONLY the label \"ANSWER\" MUST be in ENGLISH ALWAYS, the rest of the string follows the selected language"
          
      ),
      "ordering": (
          "List 4–5 steps or events in shuffled order, numbered 1 to 5. "
          "On a new line write: ANSWER (IN ENGLISH): [correct order as comma-separated numbers, e.g. 3,1,4,2,5]"
          "ONLY the label \"ANSWER\" MUST be in ENGLISH ALWAYS, the rest of the string follows the selected language"
          
      ),
    }

    return instructions.get(question_type,
    instructions["multiple_choice"])


def parse_question_response(raw_response: str, question_type: str) -> dict:
    
    raw_response = raw_response.strip()
    
    lines = raw_response.split('\n')
    question = list()
    
    for line in lines:
        if line.startswith("ANSWER"):
            break
        question.append(line)
            
    answer_line = next((l for l in lines if l.upper().startswith("ANSWER")), None)
    correct_answer = answer_line.split(":", 1)[-1].strip() if answer_line else ""

    justification = None
    if question_type == "true_false":
        just_line = next((l for l in lines if l.upper().startswith("JUSTIFICATION")), None)
        justification = just_line.split(":", 1)[-1].strip() if just_line else None

    retDictVal = build_question_dict_val(type=question_type, question=question, correct_answer=correct_answer, justification=justification)
    
    retDict = {QUESTION_TYPES.get(question_type): retDictVal}
    
    return retDict
            
    """
    Args:
        raw_response:  Raw string returned by call_granite()
        question_type: The type that was requested

    Returns:
        dict: Structured question data ready to send to the frontend
    """
    


def build_question_dict_val(type: str, question: list, correct_answer: str, justification: str = None) -> dict:
    
    questionHead = ""
    answer = "\n".join(correct_answer)
    
    
    retDict = {
        "type": type,
        "question": "\n".join(question),
        "correct_answer": correct_answer
    }
   
    if type == "multiple_choice":
        options = [l for l in question if l.strip() and l.strip()[0] in "ABCD" and ")" in l]
        retDict["options"] = options

    elif type == "ordering":
        items = [l.strip() for l in question if l.strip() and l.strip()[0].isdigit()]
        retDict["items"] = items

    elif type == "true_false":
        retDict["justification"] = justification
        
    return retDict
        
    
            
        
            
        
            
    