# Vernā — AI-Powered Multilingual Adaptive Learning

> SDG #4: Quality Education · Hackathon Project

Vernā generates fully native-language lessons, flashcards, and quiz questions on any topic using IBM Granite via watsonx.ai. It adapts difficulty in real time based on your performance and supports 8 languages — content is generated natively, never translated.

---

## Demo

[![Vernā Demo](https://img.youtube.com/vi/3bZddmDYN7M/maxresdefault.jpg)](https://youtu.be/3bZddmDYN7M)

> Click the thumbnail to watch the full demo on YouTube.

---

## Features

- **AI Curriculum Generation** — enter any topic and get a 6–8 node concept graph built by IBM Granite
- **Adaptive Difficulty** — confidence scoring adjusts question difficulty (1–5) and question type based on accuracy, streak, and response time
- **5 Question Types** — multiple choice, true/false, fill-in-the-blank, short answer, and ordering (drag-and-drop)
- **Flashcards + Lessons** — every concept node starts with a flashcard and a lesson before the challenge question
- **AI Feedback** — personalised feedback for correct and incorrect answers, with follow-up facts
- **Ask a Question** — slide-in Q&A drawer lets you ask the AI tutor anything about the current topic
- **Session History** — past sessions saved to Supabase; resume any previous curriculum
- **8 Languages** — English, Spanish, French, Mandarin, Arabic (RTL), Hindi, Portuguese, Swahili
- **Full i18n UI** — all static interface text translated via react-i18next

---

## Tech Stack

| Layer    | Technology                                                  |
|----------|-------------------------------------------------------------|
| Frontend | React 18 + Vite + Tailwind CSS v4                           |
| Backend  | Python 3.11 + Flask                                         |
| AI       | IBM Granite (`ibm/granite-13b-instruct-v2`) via watsonx.ai  |
| Auth     | Supabase Auth (JWT Bearer tokens)                           |
| Database | Supabase (Postgres) — sessions + lesson history             |
| Fonts    | Cormorant Garamond (titles) + Lora (body)                   |

---

## Project Structure

```
LearnFast/
├── backend/
│   ├── app.py                  # Flask app — all routes
│   ├── helper.py               # watsonx.ai HTTP client
│   ├── db.py                   # Supabase client + DB operations
│   ├── requirements.txt
│   ├── ai/
│   │   ├── client.py           # call_granite() wrapper
│   │   ├── prompts.py          # All prompt builders
│   │   ├── generator.py        # Orchestrates prompts → parser
│   │   └── question_types.py   # Format instructions + response parser
│   ├── core/
│   │   ├── curriculum.py       # Node traversal logic
│   │   ├── difficulty.py       # Adaptive difficulty algorithm
│   │   └── session.py          # Session lifecycle
│   └── models/
│       └── schemas.py          # Request/response dataclasses
└── frontend/
    ├── src/
    │   ├── App.jsx             # Root router + auth gate
    │   ├── i18n/               # react-i18next setup + 8 locale JSON files
    │   ├── api/client.js       # All API calls
    │   ├── hooks/              # useAuth, useLanguage, useSession
    │   ├── pages/              # HomePage, SessionPage, LoginPage, etc.
    │   └── components/         # Cards, CurriculumMap, HistoryPanel, QADrawer
    └── package.json
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Supabase](https://supabase.com) project with `sessions` and `lesson_history` tables
- An [IBM watsonx.ai](https://www.ibm.com/watsonx) account with a project and API key

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```
IBM_API_KEY=your_ibm_api_key
IBM_PROJECT_ID=your_watsonx_project_id
IBM_WATSONX_URL=https://us-south.ml.cloud.ibm.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
```

```bash
python app.py
# → http://127.0.0.1:5000
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://127.0.0.1:5000
```

```bash
npm run dev
# → http://localhost:5173
```

### Supabase Tables

Run these in the Supabase SQL editor:

```sql
create table sessions (
  session_id uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  language   text,
  topic      text,
  data       jsonb,
  last_updated_at timestamp with time zone default now()
);

create table lesson_history (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid references sessions not null,
  user_id    uuid,
  type       text,
  language   text,
  topic      text,
  difficulty int,
  content    jsonb,
  created_at timestamp with time zone default now()
);
```

> **Note:** Disable email confirmation in Supabase under Authentication → Settings so new accounts can log in immediately.

---

## API Routes

| Method | Route                           | Auth | Purpose                             |
|--------|---------------------------------|------|-------------------------------------|
| GET    | `/`                             | No   | Health check                        |
| POST   | `/auth/signup`                  | No   | Create account                      |
| POST   | `/auth/login`                   | No   | Returns access + refresh tokens     |
| POST   | `/auth/logout`                  | No   | Invalidates session                 |
| POST   | `/session/start`                | JWT  | Create session, generate curriculum |
| POST   | `/lesson`                       | No   | Generate lesson for current node    |
| POST   | `/flashcard`                    | No   | Generate flashcard for current node |
| POST   | `/challenge`                    | No   | Generate question                   |
| POST   | `/answer`                       | No   | Check answer, return feedback       |
| POST   | `/ask`                          | No   | Q&A with AI tutor                   |
| GET    | `/curriculum/<session_id>`      | JWT  | Get curriculum node list            |
| GET    | `/session/<session_id>/stats`   | JWT  | Get performance stats               |
| POST   | `/session/<session_id>/reset`   | JWT  | Reset session                       |
| GET    | `/session/<session_id>/history` | JWT  | Get lesson history from DB          |

---

## Adaptive Difficulty

Scores range 1–5. The algorithm uses a **confidence score** based on accuracy of the last 5 answers, time factor, and streak bonus:

- **Increases** if confidence ≥ 0.8 and streak ≥ 3
- **Decreases** if confidence ≤ 0.4 or last 3 answers are all wrong
- Question types unlock progressively — ordering and short answer only appear at higher difficulty levels

---

## Supported Languages

English · Spanish · French · Mandarin · Arabic · Hindi · Portuguese · Swahili

All content (curriculum nodes, lessons, flashcards, questions, feedback) is generated **natively** in the selected language using IBM Granite — nothing is translated after generation.
