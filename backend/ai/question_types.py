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
    """
    Return the Granite format instruction for the given question type.

    What to do:
    - Match question_type and return the exact instruction string for that type.
      The instruction tells Granite the exact output format so parse_question_response()
      can reliably split the response.

    Format instructions to return (copy verbatim into your match/if block):

        "multiple_choice":
            "Write a multiple choice question with exactly 4 options labeled A, B, C, D.
             On a new line write: ANSWER: [the correct letter only, e.g. B]"

        "fill_blank":
            "Write one sentence with a key word or phrase replaced by ___.
             On a new line write: ANSWER: [the missing word or phrase]"

        "true_false":
            "Write a factual True or False statement.
             On a new line write: ANSWER: [True or False]
             On a new line write: JUSTIFICATION: [one sentence explaining why]"

        "short_answer":
            "Write an open-ended question requiring a 1–2 sentence response.
             On a new line write: ANSWER: [a model answer — used for feedback context only]"

        "ordering":
            "List 4–5 steps or events from {topic} in shuffled order, numbered 1 to 5.
             On a new line write: ANSWER: [the correct order as comma-separated numbers, e.g. 3,1,4,2,5]"

    - If question_type is not recognized, return the "multiple_choice" instruction as default.

    Args:
        question_type: One of the keys in QUESTION_TYPES

    Returns:
        str: Format instruction to embed in the challenge prompt
    """
    pass


def parse_question_response(raw_response: str, question_type: str) -> dict:
    """
    Parse Granite's raw text into a structured question dict.

    What to do:
    - Strip leading/trailing whitespace from raw_response
    - Split on newlines and scan for lines starting with "ANSWER:" (and "JUSTIFICATION:" for true_false)
    - Everything before the ANSWER: line = the question body
    - Everything after "ANSWER: " = the correct answer string

    Return shape per type:

        "multiple_choice":
            {
                "type":           "multiple_choice",
                "question":       <full question text including A/B/C/D options>,
                "correct_answer": <single letter e.g. "B">,
                "options":        <list of 4 strings — parse lines starting with "A)", "B)", etc.>
            }

        "fill_blank":
            {
                "type":           "fill_blank",
                "question":       <sentence containing ___>,
                "correct_answer": <word or phrase>
            }

        "true_false":
            {
                "type":           "true_false",
                "question":       <statement text>,
                "correct_answer": <"True" or "False">,
                "justification":  <explanation string from JUSTIFICATION: line>
            }

        "short_answer":
            {
                "type":           "short_answer",
                "question":       <open-ended question>,
                "correct_answer": <model answer — not used for exact matching, only for feedback>
            }

        "ordering":
            {
                "type":           "ordering",
                "question":       <introductory text before the numbered list>,
                "items":          <list of step strings in the shuffled order Granite provided>,
                "correct_answer": <comma-separated order string e.g. "3,1,4,2,5">
            }

    Fallback — if parsing raises any exception or ANSWER: line is missing:
        {
            "type":           question_type,
            "question":       raw_response,
            "correct_answer": ""
        }
    Wrap the parsing logic in a try/except and return the fallback on any error.

    Args:
        raw_response:  Raw string returned by call_granite()
        question_type: The type that was requested

    Returns:
        dict: Structured question data ready to send to the frontend
    """
    pass
