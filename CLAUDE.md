# LearnFast — Claude Code Context

AI-powered multilingual adaptive learning app. Hackathon project, SDG #4 (Education).
User picks a topic + language → AI generates a curriculum → flashcard → lesson → challenge question →
adaptive difficulty adjusts → AI feedback → repeat per concept node until curriculum complete.
Everything generated natively in the target language — never translate after.

---

## Tech Stack

| Layer      | Tech                                                             |
|------------|------------------------------------------------------------------|
| Backend    | Python + Flask (not FastAPI)                                     |
| AI         | IBM Granite (`ibm/granite-13b-instruct-v2`) via watsonx.ai raw HTTP |
| Auth       | Supabase Auth (JWT — Bearer tokens)                              |
| DB         | Supabase (Postgres) — sessions + lesson_history tables           |
| Frontend   | React + Vite + Tailwind CSS v4                                   |
| Fonts      | Cormorant Garamond (titles, italic) + Lora (body, serif)         |

---

## Repo Structure

```
LearnFast/
├── CLAUDE.md
├── backend/
│   ├── app.py                  # Flask app — all routes, fully implemented
│   ├── helper.py               # watsonx HTTP calls (DO NOT reimplment)
│   ├── db.py                   # Supabase client + auth + session/history DB ops
│   ├── requirements.txt
│   ├── sanity_test.py          # End-to-end test for all 5 question types
│   ├── ai/
│   │   ├── client.py           # call_granite() wrapper — reads .env, calls helper.py
│   │   ├── prompts.py          # All prompt builders (system, lesson, challenge, feedback, flashcard, QA, curriculum)
│   │   ├── generator.py        # Orchestrates prompts → client → parser for all content types
│   │   └── question_types.py   # Format instructions + parse_question_response() + preamble stripper
│   ├── core/
│   │   ├── curriculum.py       # Node traversal: get_current_node, record_answer, build_node_context
│   │   ├── difficulty.py       # Adaptive algorithm: confidence score, adjust_difficulty, select_question_type
│   │   └── session.py          # Session dict lifecycle: create, update, get_stats, reset
│   └── models/
│       └── schemas.py          # Request/response dataclasses (reference only, no logic)
└── frontend/
    ├── .env                    # VITE_API_URL=http://127.0.0.1:5000
    ├── src/
    │   ├── index.css           # Design system — all CSS variables, component classes
    │   ├── App.jsx             # Root router (home/loading/session/complete) + auth gate
    │   ├── api/
    │   │   └── client.js       # All API calls + parseChallenge() normaliser
    │   ├── constants/
    │   │   └── languages.js    # SUPPORTED_LANGUAGES array
    │   ├── hooks/
    │   │   ├── useAuth.js      # login/signup/logout — stores access_token in localStorage
    │   │   └── useLanguage.js  # selectedLanguage state + changeLanguage
    │   ├── utils/
    │   │   └── direction.js    # getDirection(language) → "rtl" | "ltr" for Arabic
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── SignUpPage.jsx
    │   │   ├── HomePage.jsx        # Topic input + language grid → calls api.startSession
    │   │   ├── LoadingPage.jsx     # Spinner shown while session is being created
    │   │   ├── SessionPage.jsx     # Main orchestrator: card history array, fetchLesson/Challenge, handleAnswer
    │   │   └── CompletionPage.jsx  # Stats grid shown when curriculum_complete
    │   └── components/
    │       ├── Icons.jsx           # All SVG icons — no emojis anywhere in the app
    │       ├── CurriculumMap.jsx   # Left sidebar (hidden below lg), shows node status
    │       ├── QADrawer.jsx        # Slide-in overlay for Q&A thread with tutor
    │       └── cards/
    │           ├── CardStack.jsx   # Stack effect (ghost cards), dot indicator, nav arrows, ask-question button
    │           ├── CardFrame.jsx   # Wrapper applying notebook-card aesthetic + spinner
    │           ├── FlashCard.jsx   # 3D CSS flip card (perspective + preserve-3d)
    │           ├── LessonCard.jsx  # Lesson text + "Ready for a challenge" CTA
    │           ├── QuestionCard.jsx # Delegates to question type components
    │           └── FeedbackCard.jsx # Correct/wrong result + AI feedback + transition message
    │       └── questions/
    │           ├── MultipleChoice.jsx  # A–D letter badge buttons
    │           ├── FillBlank.jsx       # Inline input on ___ or fallback input below question
    │           ├── TrueFalse.jsx       # Two large buttons, auto-submits after 350ms
    │           ├── ShortAnswer.jsx     # Textarea + submit
    │           └── Ordering.jsx        # HTML5 drag-and-drop reordering
```

Dead files (old architecture, not used — safe to delete):
`frontend/src/pages/{ChallengePage,FeedbackPage,HistoryPage,LessonPage,StatsPage}.jsx`
`frontend/src/components/{Header,LanguageSwitcher}.jsx`

---

## Environment Variables

### Backend (`backend/.env`)
```
IBM_API_KEY=...
IBM_PROJECT_ID=...
IBM_WATSONX_URL=https://us-south.ml.cloud.ibm.com
SUPABASE_URL=https://....supabase.co
SUPABASE_KEY=...
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://127.0.0.1:5000
```

---

## Running the Project

```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py
# → http://127.0.0.1:5000

# Frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173 (or 5174 if 5173 is taken)
```

---

## API Routes

| Method | Route                          | Auth required | Purpose                                        |
|--------|--------------------------------|---------------|------------------------------------------------|
| GET    | `/`                            | No            | Health check                                   |
| GET    | `/languages`                   | No            | Returns list of supported language strings     |
| POST   | `/auth/signup`                 | No            | Creates Supabase user account                  |
| POST   | `/auth/login`                  | No            | Returns access_token + refresh_token           |
| POST   | `/auth/logout`                 | No            | Invalidates Supabase session                   |
| POST   | `/session/start`               | Yes (JWT)     | Creates session, generates curriculum          |
| POST   | `/lesson`                      | No            | Generates lesson for current curriculum node   |
| POST   | `/flashcard`                   | No            | Generates flashcard for current node concept   |
| POST   | `/challenge`                   | No            | Generates question (type selected by difficulty)|
| POST   | `/answer`                      | No            | Checks answer, updates session, returns feedback|
| POST   | `/ask`                         | No            | Q&A — answers a student question about the topic|
| GET    | `/curriculum/<session_id>`     | Yes (JWT)     | Returns curriculum node list with statuses     |
| GET    | `/session/<session_id>/stats`  | Yes (JWT)     | Returns performance stats                      |
| POST   | `/session/<session_id>/reset`  | Yes (JWT)     | Resets session metrics, restarts curriculum    |
| GET    | `/session/<session_id>/history`| Yes (JWT)     | Returns lesson_history rows from DB            |

Note: `/lesson`, `/challenge`, `/answer`, `/flashcard`, `/ask` are intentionally unprotected —
they rely on `session_id` from the body (sessions are already tied to a user in the DB).

---

## Session Flow (Frontend)

```
api.startSession(topic, language)
    → session created + curriculum generated (6–8 nodes)
    → SessionPage bootstraps with parallel calls:
        Promise.all([api.getFlashcard, api.getLesson])

Per node loop:
    flashcard → lesson → challenge question → answer → feedback
        feedback.next_action drives what comes next:
            "advance"             → next node: fetchFlashcard()
            "re_explore"          → same node: fetchChallenge()
            "rollback"            → prerequisite node: fetchLesson()
            "curriculum_complete" → CompletionPage
```

Card history is stored as `cards[]` + `cardIdx` in SessionPage state.
Going back = decrement `cardIdx`. Going forward past end = fetch next card from API.

---

## Challenge Response Shape

The backend returns question data with a human-readable key:
```json
{ "True or False with Justification": { "type": "true_false", "question": "...", "correct_answer": "True" } }
```

`parseChallenge()` in `client.js` normalises this:
- Finds the first non-"error" key
- Reads `q.type` (or falls back to the key itself)
- Normalises to snake_case (`question_type`)
- Returns `{ ...q, question_type }` spread so all fields land flat on the data object

---

## Adaptive Difficulty

Scores range 1–5. Algorithm in `core/difficulty.py`:
- **Confidence score** = (accuracy of last 5) × time_factor + streak_bonus (capped 0.3)
- **Increase** if confidence ≥ 0.8 AND streak ≥ 3
- **Decrease** if confidence ≤ 0.4 OR last 3 all wrong
- **Question type pool** per difficulty:
  - 1: true_false, multiple_choice
  - 2: multiple_choice, fill_blank
  - 3: multiple_choice, fill_blank, short_answer
  - 4: fill_blank, short_answer, ordering
  - 5: short_answer, ordering

---

## Design System

All tokens in `frontend/src/index.css` as CSS custom properties. Key colours:

| Token           | Value      | Use                               |
|-----------------|------------|-----------------------------------|
| `--bg`          | `#0b1709`  | Page backgrounds (dark forest)    |
| `--card`        | `#f8f4e8`  | Notebook card (parchment)         |
| `--card-line`   | `#e6dfc6`  | Ruled lines on notebook card      |
| `--card-margin` | `#d4a0a0`  | Red left margin on notebook card  |
| `--green`       | `#4a7c38`  | Primary action colour             |
| `--ink`         | `#1e1a10`  | Text on paper cards (dark brown)  |
| `--text`        | `#c8dfc0`  | Text on dark backgrounds          |

Component classes: `.notebook-card`, `.notebook-card-plain`, `.notebook-ghost`,
`.btn-primary`, `.btn-outline`, `.option-btn`, `.ink-input`, `.paper-textarea`, `.font-title`, `.card-enter`

No emojis anywhere — all icons are SVG components exported from `components/Icons.jsx`.

---

## Supabase Tables

**`sessions`**
| Column           | Type      |
|------------------|-----------|
| session_id       | uuid PK   |
| user_id          | uuid (FK) |
| language         | text      |
| topic            | text      |
| data             | jsonb     | ← full session dict
| last_updated_at  | timestamp |

**`lesson_history`**
| Column     | Type      |
|------------|-----------|
| id         | uuid PK   |
| session_id | uuid (FK) |
| user_id    | uuid      |
| type       | text      | ← 'lesson', 'challenge', 'feedback'
| language   | text      |
| topic      | text      |
| difficulty | int       |
| content    | jsonb     |
| created_at | timestamp |

---

## Supported Languages

English, Spanish, French, Mandarin, Arabic (RTL — `dir="rtl"` set via `getDirection()`),
Hindi, Portuguese, Swahili.

---

## Known Quirks

- **fill_blank without `___`**: Granite sometimes doesn't emit the blank marker (especially for math). FillBlank component handles this — detects no `___` and renders a standard text input below the question instead.
- **Preamble stripping**: `_strip_preamble()` in `question_types.py` can accidentally strip the question itself if it starts with a phrase like "Using the following...". True/false questions are most affected.
- **Session not in memory after restart**: Routes fall back to `load_session(session_id)` from Supabase, so sessions survive server restarts.
- **IBM IAM token**: `helper.py` fetches a fresh token on every call (no caching). This adds ~300ms per request. Acceptable for hackathon, but cache it for production.
- **Supabase email confirmation**: Disable in Supabase dashboard under Authentication → Settings → Disable email confirmations, or new signups won't be able to log in immediately.

---

## What NOT to Do

- Don't reimplement the watsonx call — `backend/helper.py` handles auth and HTTP, use `call_granite()` from `ai/client.py`
- Don't install `ibm_watsonx_ai` SDK — raw `requests` in helper.py, keep it consistent
- Don't trust `difficulty` from request bodies — always read from `session["difficulty"]`
- Don't translate content after generation — all content must be generated natively in the target language
- Don't add emojis to the frontend — use SVG components from `Icons.jsx`
- Don't add new question types without updating: `DIFFICULTY_QUESTION_TYPES` (difficulty.py), `get_question_type_instruction` + `parse_question_response` (question_types.py), and `QuestionCard.jsx`
