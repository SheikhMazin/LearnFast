# LearnFast — Claude Code Context

AI-powered multilingual adaptive learning app. Hackathon project, SDG #4 (Education).
The goal: user picks a topic + language → AI generates a lesson → user answers questions →
adaptive difficulty adjusts in real time → AI gives feedback. Everything generated natively
in the target language — never translate after.

---

## Tech Stack

| Layer      | Tech                                                        |
|------------|-------------------------------------------------------------|
| Backend    | Python + Flask (not FastAPI despite some docs saying so)    |
| AI         | IBM Granite via watsonx.ai (raw HTTP, not the SDK)          |
| DB         | SQLite (not yet wired up — in-memory sessions for now)      |
| Frontend   | React + Vite + Tailwind (not started yet)                   |

---

## Repo Structure

```
backend/
├── app.py                  # Flask app — all routes live here
├── helper.py               # ALREADY IMPLEMENTED — watsonx HTTP calls (use this)
├── requirements.txt
├── ai/
│   ├── client.py           # watsonx client wrapper — stub, calls helper.py
│   ├── prompts.py          # prompt builders — stub, all pass
│   ├── generator.py        # orchestrates prompts + client — stub, all pass
│   └── question_types.py   # question format instructions + response parser — stub
├── core/
│   ├── difficulty.py       # adaptive difficulty algorithm — stub, all pass
│   └── session.py          # per-session state management — stub, all pass
└── models/
    └── schemas.py          # request/response dataclasses — defined, no logic needed
```

---

## Critical: helper.py Is Already Working

**Do not reimplement the watsonx call.** `backend/helper.py` already handles auth and generation:

```python
from backend.helper import call_watsonx

text = call_watsonx(system_prompt, user_message, API_KEY, URL, PROJECT_ID)
```

- `get_iam_token(API_KEY)` — exchanges IBM API key for a Bearer token via IAM
- `call_watsonx(system_prompt, user_message, API_KEY, URL, PROJECT_ID)` — POSTs to watsonx,
  returns the generated text string directly

Model used: `ibm/granite-13b-instruct-v2`
API version: `2024-05-31`

### .env file needed (never commit this)

```
IBM_API_KEY=your_key_here
IBM_PROJECT_ID=your_project_id_here
IBM_WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

---

## What Still Needs Implementing

Every function body is `pass`. Each file has detailed comments describing exactly what to write.
Implement in this order — each step unblocks the next:

### 1. `backend/ai/client.py`
Thin wrapper around `helper.py`. `call_granite()` should just read env vars and call
`call_watsonx()` from helper. The singleton pattern in this file is optional — helper.py
is stateless so no client object needs to persist.

### 2. `backend/ai/prompts.py`
Four functions that build strings — no external calls, pure Python:
- `get_system_prompt(language)` — sets tutor persona + language lock
- `build_lesson_prompt(topic, language, difficulty)` — asks for <80 word explanation
- `build_challenge_prompt(topic, language, lesson_context, difficulty, question_type)`
- `build_feedback_prompt(user_answer, correct_answer, language, is_correct, topic)`

Key rule from the product doc: language instruction goes in the **system prompt**, not the
user message. All content (options, feedback, error messages) must be in the target language.

### 3. `backend/ai/question_types.py`
- `get_question_type_instruction(question_type)` — returns the format string to paste into
  the challenge prompt so Granite formats its output parseably (ANSWER: on its own line)
- `parse_question_response(raw_response, question_type)` — splits on "ANSWER:" to extract
  question body and correct answer. Wrap everything in try/except — return a fallback dict
  if parsing fails.

### 4. `backend/ai/generator.py`
Three functions that wire prompts → client → parser:
- `generate_lesson()` → returns `{lesson, topic, language, difficulty}`
- `generate_challenge()` → returns parsed question dict from `parse_question_response()`
- `generate_feedback()` → returns `{feedback, is_correct, language}`

### 5. `backend/core/difficulty.py`
The adaptive algorithm — pure Python math, no AI calls:
- `calculate_confidence_score(streak, correctness_history, avg_time_seconds)` → float 0–1
  Formula: accuracy of last 5 answers × time factor + streak bonus (capped at 0.3)
- `adjust_difficulty(current_difficulty, session_stats)` → int 1–5
  Increase if confidence ≥ 0.8 AND streak ≥ 3. Decrease if confidence ≤ 0.4 OR last 3 all wrong.
- `select_question_type(difficulty, last_question_type)` → string
  Uses `DIFFICULTY_QUESTION_TYPES` dict — avoids repeating the same type twice in a row.
- `get_difficulty_label(difficulty)` → string (e.g. "intermediate")

### 6. `backend/core/session.py`
Dict-based session state — no DB yet:
- `create_session(language, topic, starting_difficulty)` → fresh session dict with uuid
- `update_session(session, is_correct, time_taken_seconds, question_type)` → mutates and
  returns session; calls `adjust_difficulty()` internally
- `get_session_stats(session)` → summary dict safe to send to frontend
- `reset_session(session)` → clears metrics, keeps identity fields

### 7. `backend/app.py` routes
Six stub routes — implement after everything above is working:
- `POST /session/start` — creates session, stores in `_sessions` dict
- `POST /lesson` — reads difficulty from session, calls `generate_lesson()`
- `POST /challenge` — reads difficulty + last_question_type from session, calls `generate_challenge()`
- `POST /answer` — checks correctness, calls `update_session()` + `generate_feedback()`
- `GET /session/<session_id>/stats` — returns `get_session_stats()`
- `POST /session/<session_id>/reset` — calls `reset_session()`

The in-memory store is `_sessions: dict` at the top of `app.py`. Key = session_id string.

---

## Supported Languages

| Language   | Script       | Notes                    |
|------------|--------------|--------------------------|
| English    | LTR          | Baseline                 |
| Spanish    | LTR          | MVP                      |
| French     | LTR          | MVP                      |
| Mandarin   | LTR/Vertical | MVP                      |
| Arabic     | RTL          | MVP — test RTL UI early  |
| Hindi      | LTR          | MVP                      |
| Portuguese | LTR          | MVP                      |
| Swahili    | LTR          | High SDG impact          |

---

## Question Types

| Key              | Format Granite must output                                      |
|------------------|-----------------------------------------------------------------|
| `multiple_choice`| 4 options A–D, then `ANSWER: B`                                 |
| `fill_blank`     | Sentence with `___`, then `ANSWER: word`                        |
| `true_false`     | Statement, then `ANSWER: True/False`, then `JUSTIFICATION: ...` |
| `short_answer`   | Open question, then `ANSWER: model answer`                      |
| `ordering`       | Shuffled numbered steps, then `ANSWER: 3,1,4,2,5`              |

---

## API Routes

| Method | Route                          | Purpose                             |
|--------|--------------------------------|-------------------------------------|
| GET    | `/languages`                   | Returns list of supported languages |
| POST   | `/session/start`               | Creates a new session               |
| POST   | `/lesson`                      | Generates lesson for topic          |
| POST   | `/challenge`                   | Generates question                  |
| POST   | `/answer`                      | Submits answer, returns feedback    |
| GET    | `/session/<id>/stats`          | Returns session performance stats   |
| POST   | `/session/<id>/reset`          | Resets session metrics              |

---

## Running the Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
# Server starts at http://localhost:5000
```

Test with Thunder Client, Postman, or `curl`. The `/` route returns `{"status": "LearnFast backend running"}` to confirm it's up.

---

## What NOT to Do

- Don't add authentication/login — not in scope for the demo
- Don't add Docker, Redis, or microservices — hackathon, 22 hours
- Don't translate content after generation — always generate natively in the target language
- Don't install the `ibm_watsonx_ai` SDK — `helper.py` uses raw `requests`, keep it consistent
- Don't trust `difficulty` from the request body — always read it from the session dict
