from dataclasses import dataclass, field
from typing import Optional


# ---------------------------------------------------------------------------
# Request bodies — validate these at the start of each Flask route handler
# ---------------------------------------------------------------------------

@dataclass
class LessonRequest:
    """
    Expected JSON body for POST /lesson.

    Validation rules to enforce in the route:
    - topic:      non-empty string, max 100 chars
    - language:   must be one of the 8 supported language strings
    - difficulty: int between 1 and 5 inclusive; if omitted, read from active session
                  or default to 2
    """
    topic: str
    language: str
    difficulty: int = 2


@dataclass
class ChallengeRequest:
    """
    Expected JSON body for POST /challenge.

    Validation rules:
    - topic:          non-empty string
    - language:       must be a supported language string
    - lesson_context: the lesson text returned by the /lesson call this round
                      (pass it back so Granite has continuity without needing a DB lookup)
    - session_id:     UUID string of the active session; used to look up current difficulty
                      and last_question_type from the in-memory session store
    """
    topic: str
    language: str
    lesson_context: str
    session_id: str


@dataclass
class AnswerRequest:
    """
    Expected JSON body for POST /answer.

    Validation rules:
    - session_id:     UUID of the active session
    - user_answer:    what the user submitted (string, even for MC — send the letter e.g. "B")
    - correct_answer: the correct_answer field from the challenge dict sent to the frontend
                      (echo it back so the backend can compare without a DB round-trip)
    - question_type:  the type string from the challenge dict (for scoring logic)
    - time_taken_seconds: float, how long the user spent on this question
    """
    session_id: str
    user_answer: str
    correct_answer: str
    question_type: str
    time_taken_seconds: float = 0.0


@dataclass
class SessionStartRequest:
    """
    Expected JSON body for POST /session/start.

    Validation rules:
    - language: must be a supported language string
    - topic:    non-empty string
    - difficulty: optional int 1–5; defaults to 2 (elementary) if omitted
    """
    language: str
    topic: str
    difficulty: int = 2


# ---------------------------------------------------------------------------
# Response shapes — build these dicts in your route handlers before jsonify()
# ---------------------------------------------------------------------------

@dataclass
class LessonResponse:
    """
    Shape of the JSON returned by POST /lesson.

    Fields:
    - lesson:     the generated lesson text (string, in target language)
    - topic:      echoed back from the request
    - language:   echoed back
    - difficulty: the difficulty level used to generate this lesson
    """
    lesson: str
    topic: str
    language: str
    difficulty: int


@dataclass
class ChallengeResponse:
    """
    Shape of the JSON returned by POST /challenge.

    Fields vary by question_type — see question_types.py for the full shape.
    Common fields present in all types:
    - type:           question type string
    - question:       the question text (in target language)
    - correct_answer: the answer string (send this to the frontend; it will echo it back in AnswerRequest)

    Additional fields by type:
    - multiple_choice: + options (list of 4 strings)
    - true_false:      + justification (shown after the user answers)
    - ordering:        + items (list of shuffled step strings)
    - fill_blank:      (no extra fields)
    - short_answer:    (no extra fields)
    """
    type: str
    question: str
    correct_answer: str


@dataclass
class FeedbackResponse:
    """
    Shape of the JSON returned by POST /answer (which triggers feedback generation).

    Fields:
    - feedback:    the AI-generated feedback text (in target language)
    - is_correct:  bool — was the answer correct?
    - language:    target language (so frontend can apply RTL if needed)
    - session:     the updated session stats dict (from get_session_stats())
                   so the frontend can update the difficulty/streak display
    """
    feedback: str
    is_correct: bool
    language: str
    session: dict = field(default_factory=dict)


@dataclass
class SessionResponse:
    """
    Shape returned by POST /session/start and GET /session/<session_id>/stats.

    Fields:
    - session_id:         UUID string
    - language:           target language
    - topic:              subject being studied
    - questions_answered: int
    - total_correct:      int
    - accuracy:           float 0–1
    - current_streak:     int
    - current_difficulty: int 1–5
    - confidence_score:   float 0–1
    - avg_time_seconds:   float
    """
    session_id: str
    language: str
    topic: str
    questions_answered: int = 0
    total_correct: int = 0
    accuracy: float = 0.0
    current_streak: int = 0
    current_difficulty: int = 2
    confidence_score: float = 0.0
    avg_time_seconds: float = 0.0
