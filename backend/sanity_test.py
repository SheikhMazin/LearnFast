#!/usr/bin/env python3
"""
LearnFast API Sanity Test Suite
Covers: auth, session validation, all 5 question types, 6 languages,
        adaptive difficulty, answer patterns, session reset, edge cases.
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import requests
import time

BASE = "http://localhost:5000"
TEST_EMAIL = "sanity_test@learnfast.com"
TEST_PASSWORD = "sanitytest123"

results = []

def check(name: str, condition: bool, detail: str = "") -> bool:
    icon = "PASS" if condition else "FAIL"
    results.append((icon, name, detail))
    suffix = f" — {detail}" if detail else ""
    print(f"  [{icon}] {name}{suffix}")
    return condition

def section(title: str):
    print(f"\n{'='*65}")
    print(f"  {title}")
    print("=" * 65)

# ── Request helpers ───────────────────────────────────────────

def post(path, json_body=None, token=None, timeout=60):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    try:
        return requests.post(f"{BASE}{path}", json=json_body, headers=headers, timeout=timeout)
    except Exception as e:
        return None

def get(path, token=None, timeout=30):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    try:
        return requests.get(f"{BASE}{path}", headers=headers, timeout=timeout)
    except Exception as e:
        return None

def login(email=TEST_EMAIL, password=TEST_PASSWORD):
    r = post("/auth/login", {"email": email, "password": password})
    if r is not None and r.status_code == 200:
        return r.json().get("access_token")
    return None

def start_session(token, language="English", topic="photosynthesis", difficulty=2):
    r = post("/session/start", {"language": language, "topic": topic, "difficulty": difficulty}, token=token)
    if r is not None and r.status_code == 201:
        return r.json()
    return None

def get_lesson(session_id):
    r = post("/lesson", {"session_id": session_id})
    if r is not None and r.status_code == 200:
        return r.json()
    return None

def get_challenge(session_id, lesson_context=""):
    r = post("/challenge", {"session_id": session_id, "lesson_context": lesson_context})
    if r is not None and r.status_code == 200 and "error" not in r.json():
        return r.json()
    return None

def submit_answer(session_id, user_answer, correct_answer, question_type, time_taken=10.0):
    r = post("/answer", {
        "session_id": session_id,
        "user_answer": user_answer,
        "correct_answer": correct_answer,
        "question_type": question_type,
        "time_taken_seconds": time_taken,
    })
    if r is not None and r.status_code == 200:
        return r.json()
    return None

def full_round(session_id, user_answer_override=None, time_taken=10.0):
    """Run lesson -> challenge -> answer. Returns (challenge_data, answer_result)."""
    lesson = get_lesson(session_id)
    if not lesson:
        return None, None
    challenge = get_challenge(session_id, lesson.get("lesson", ""))
    if not challenge:
        return None, None
    q = list(challenge.values())[0]
    answer = user_answer_override if user_answer_override is not None else q["correct_answer"]
    result = submit_answer(session_id, answer, q["correct_answer"], q["type"], time_taken)
    return q, result

# ==============================================================
# 1. AUTH
# ==============================================================

def test_auth():
    section("1. AUTH")

    # Ensure test account exists
    r = post("/auth/signup", {"email": TEST_EMAIL, "password": TEST_PASSWORD})
    check("signup returns 201 or 400 (already exists)", r is not None and r.status_code in [201, 400])

    # Valid login
    r = post("/auth/login", {"email": TEST_EMAIL, "password": TEST_PASSWORD})
    check("valid login -> 200", r is not None and r.status_code == 200)
    check("response has access_token", r is not None and "access_token" in r.json())
    token = r.json().get("access_token") if r else None

    # Wrong password
    r = post("/auth/login", {"email": TEST_EMAIL, "password": "wrongpassword"})
    check("wrong password -> 401", r is not None and r.status_code == 401)

    # Missing body
    r = post("/auth/login", {})
    check("empty login body -> 400", r is not None and r.status_code == 400)

    # Logout
    r = post("/auth/logout")
    check("logout -> 200", r is not None and r.status_code == 200)

    return token

# ==============================================================
# 2. SESSION VALIDATION
# ==============================================================

def test_session_validation(token):
    section("2. SESSION VALIDATION")

    # Missing fields
    r = post("/session/start", {"topic": "math"}, token=token)
    check("missing language -> 400", r is not None and r.status_code == 400)

    r = post("/session/start", {"language": "English"}, token=token)
    check("missing topic -> 400", r is not None and r.status_code == 400)

    # Invalid values
    r = post("/session/start", {"language": "Klingon", "topic": "math"}, token=token)
    check("unsupported language -> 400", r is not None and r.status_code == 400)

    r = post("/session/start", {"language": "English", "topic": "math", "difficulty": 99}, token=token)
    check("difficulty out of range -> 400", r is not None and r.status_code == 400)

    r = post("/session/start", {"language": "English", "topic": "math", "difficulty": 0}, token=token)
    check("difficulty=0 -> 400", r is not None and r.status_code == 400)

    # No auth token
    r = post("/session/start", {"language": "English", "topic": "math"})
    check("no auth token -> 401", r is not None and r.status_code == 401)

    # All 5 valid difficulty levels
    for diff in [1, 2, 3, 4, 5]:
        s = start_session(token, difficulty=diff)
        check(f"difficulty={diff} session creates ok", s is not None)

# ==============================================================
# 3. INVALID SESSION IDs
# ==============================================================

def test_invalid_sessions():
    section("3. INVALID SESSION IDs")
    fake = "00000000-0000-0000-0000-000000000000"

    r = post("/lesson", {"session_id": fake})
    check("lesson with fake session_id -> 404", r is not None and r.status_code == 404)

    r = post("/challenge", {"session_id": fake, "lesson_context": ""})
    check("challenge with fake session_id -> 404", r is not None and r.status_code == 404)

    r = post("/answer", {"session_id": fake, "user_answer": "A",
                         "correct_answer": "A", "question_type": "multiple_choice",
                         "time_taken_seconds": 5})
    check("answer with fake session_id -> 404", r is not None and r.status_code == 404)

# ==============================================================
# 4. QUESTION TYPES (all 5)
# ==============================================================

def test_question_types(token):
    section("4. QUESTION TYPES — all 5 via difficulty sweep")

    seen_types = {}

    # Run multiple sessions per difficulty band to accumulate type coverage
    # DIFFICULTY_QUESTION_TYPES:
    #   1: true_false, multiple_choice
    #   2: multiple_choice, fill_blank
    #   3: multiple_choice, fill_blank, short_answer
    #   4: fill_blank, short_answer, ordering
    #   5: short_answer, ordering
    for diff in [1, 2, 3, 4, 5]:
        for attempt in range(3):   # up to 3 tries per difficulty
            s = start_session(token, difficulty=diff)
            if not s:
                continue
            sid = s["session_id"]
            lesson = get_lesson(sid)
            if not lesson:
                continue
            challenge = get_challenge(sid, lesson.get("lesson", ""))
            if not challenge:
                continue
            q = list(challenge.values())[0]
            qt = q.get("type", "unknown")
            if qt not in seen_types:
                seen_types[qt] = diff
                correct = q["correct_answer"]

                # Structural checks per type
                if qt == "multiple_choice":
                    check("multiple_choice has options list", "options" in q and len(q["options"]) >= 4)
                elif qt == "fill_blank":
                    check("fill_blank question contains ___", "___" in q.get("question", ""))
                elif qt == "true_false":
                    check("true_false has justification field", "justification" in q)
                    check("true_false answer is True or False",
                          correct.strip().lower() in ["true", "false"])
                elif qt == "ordering":
                    check("ordering has items list", "items" in q and len(q["items"]) >= 2)
                elif qt == "short_answer":
                    check("short_answer has non-empty correct_answer", bool(correct.strip()))

                # Submit correct answer
                result = submit_answer(sid, correct, correct, qt)
                check(f"{qt}: correct answer -> is_correct=True",
                      result is not None and result.get("is_correct") is True)

                # Submit wrong answer (skip short_answer — always True)
                if qt != "short_answer":
                    result2 = submit_answer(sid, "ZZZWRONG123", correct, qt)
                    check(f"{qt}: wrong answer -> is_correct=False",
                          result2 is not None and result2.get("is_correct") is False)

    print(f"\n  Types encountered: {list(seen_types.keys())}")
    check("all 5 question types seen",
          len(seen_types) == 5, f"saw {len(seen_types)}/5: {list(seen_types.keys())}")

# ==============================================================
# 5. LANGUAGES
# ==============================================================

def test_languages(token):
    section("5. LANGUAGES")

    langs = [
        ("Spanish",    "fotosíntesis"),
        ("French",     "photosynthèse"),
        ("Arabic",     "photosynthesis"),
        ("Hindi",      "photosynthesis"),
        ("Mandarin",   "photosynthesis"),
        ("Swahili",    "photosynthesis"),
        ("Portuguese", "fotossíntese"),
    ]

    for language, topic in langs:
        s = start_session(token, language=language, topic=topic)
        if not check(f"{language}: session created", s is not None):
            continue

        lesson = get_lesson(s["session_id"])
        ok = lesson is not None and bool(lesson.get("lesson", "").strip())
        snippet = lesson["lesson"][:60].replace("\n", " ") + "..." if ok else "FAILED"
        check(f"{language}: lesson generated", ok, snippet)

        if not ok:
            continue

        challenge = get_challenge(s["session_id"], lesson["lesson"])
        check(f"{language}: challenge generated", challenge is not None)

        if challenge:
            q = list(challenge.values())[0]
            result = submit_answer(s["session_id"], q["correct_answer"],
                                   q["correct_answer"], q["type"])
            check(f"{language}: answer accepted", result is not None)

# ==============================================================
# 6. ADAPTIVE DIFFICULTY
# ==============================================================

def test_adaptive_difficulty(token):
    section("6. ADAPTIVE DIFFICULTY")

    # ── Difficulty should increase after 3+ correct fast answers ──
    s = start_session(token, difficulty=2)
    if not s:
        check("session for adaptive test", False)
        return
    sid = s["session_id"]
    check("session starts at difficulty 2", s["current_difficulty"] == 2)

    difficulty_went_up = False
    for i in range(6):
        q, result = full_round(sid, time_taken=5.0)   # fast correct answers
        if result:
            curr = result["session"]["current_difficulty"]
            if curr > 2:
                check(f"difficulty increased after {i+1} correct answers (now {curr})", True)
                difficulty_went_up = True
                break

    if not difficulty_went_up:
        check("difficulty increased after correct streak", False, "still at 2 after 6 rounds")

    # ── Difficulty should decrease after 3 consecutive wrong answers ──
    s2 = start_session(token, difficulty=3)
    if not s2:
        check("session for decrease test", False)
        return
    sid2 = s2["session_id"]

    difficulty_went_down = False
    for i in range(5):
        q, result = full_round(sid2, user_answer_override="WRONG_ANSWER_XYZ", time_taken=90.0)
        if result:
            curr = result["session"]["current_difficulty"]
            if curr < 3:
                check(f"difficulty decreased after {i+1} wrong answers (now {curr})", True)
                difficulty_went_down = True
                break

    if not difficulty_went_down:
        check("difficulty decreased after wrong streak", False, "still at 3 after 5 wrong")

    # ── Verify streak counter ──
    s3 = start_session(token, difficulty=2)
    if s3:
        sid3 = s3["session_id"]
        # correct -> correct -> wrong -> streak should be 0
        q, r1 = full_round(sid3)
        q, r2 = full_round(sid3)
        q, r3 = full_round(sid3, user_answer_override="WRONG")
        if r3:
            check("streak resets to 0 after wrong answer",
                  r3["session"]["current_streak"] == 0)

# ==============================================================
# 7. SESSION STATS & RESET
# ==============================================================

def test_stats_and_reset(token):
    section("7. SESSION STATS & RESET")

    s = start_session(token)
    if not s:
        check("session created", False)
        return
    sid = s["session_id"]

    # Answer 2 correct, 1 wrong
    for _ in range(2):
        q, _ = full_round(sid)
    q, _ = full_round(sid, user_answer_override="WRONG_ANSWER_XYZ")

    # Check stats
    r = get(f"/session/{sid}/stats", token=token)
    check("GET /session/stats -> 200", r is not None and r.status_code == 200)
    if r is not None and r.status_code == 200:
        stats = r.json()
        expected_keys = ["session_id", "language", "topic", "questions_answered",
                         "total_correct", "accuracy", "current_streak",
                         "current_difficulty", "confidence_score", "avg_time_seconds"]
        check("stats has all expected keys", all(k in stats for k in expected_keys))
        check("questions_answered = 3", stats.get("questions_answered") == 3)
        check("total_correct = 2", stats.get("total_correct") == 2)
        check("accuracy = 0.667", abs(stats.get("accuracy", 0) - 2/3) < 0.01,
              f"got {stats.get('accuracy')}")

    # Reset
    r2 = post(f"/session/{sid}/reset", token=token)
    check("POST /session/reset -> 200", r2 and r2.status_code == 200)

    r3 = get(f"/session/{sid}/stats", token=token)
    if r3 and r3.status_code == 200:
        stats = r3.json()
        check("after reset: questions_answered = 0", stats.get("questions_answered") == 0)
        check("after reset: total_correct = 0", stats.get("total_correct") == 0)
        check("after reset: current_streak = 0", stats.get("current_streak") == 0)

# ==============================================================
# 8. ANSWER EDGE CASES
# ==============================================================

def test_answer_edge_cases(token):
    section("8. ANSWER EDGE CASES")

    s = start_session(token, difficulty=2)
    if not s:
        check("session created", False)
        return
    sid = s["session_id"]

    def fresh_challenge():
        lesson = get_lesson(sid)
        if not lesson:
            return None
        return get_challenge(sid, lesson.get("lesson", ""))

    # Empty string answer
    challenge = fresh_challenge()
    if challenge:
        q = list(challenge.values())[0]
        result = submit_answer(sid, "", q["correct_answer"], q["type"])
        check("empty string answer -> is_correct=False",
              result is not None and result.get("is_correct") is False)

    # Case-insensitive match (answer in uppercase)
    challenge = fresh_challenge()
    if challenge:
        q = list(challenge.values())[0]
        if q["type"] != "short_answer":
            result = submit_answer(sid, q["correct_answer"].upper(),
                                   q["correct_answer"], q["type"])
            check("uppercase answer still matches",
                  result is not None and result.get("is_correct") is True)

    # Whitespace-padded answer
    challenge = fresh_challenge()
    if challenge:
        q = list(challenge.values())[0]
        if q["type"] != "short_answer":
            padded = "  " + q["correct_answer"] + "  "
            result = submit_answer(sid, padded, q["correct_answer"], q["type"])
            check("whitespace-padded answer still matches",
                  result is not None and result.get("is_correct") is True)

    # short_answer always marked correct regardless of content
    s2 = start_session(token, difficulty=4)
    if s2:
        sid2 = s2["session_id"]
        for _ in range(4):
            lesson = get_lesson(sid2)
            if not lesson:
                break
            challenge = get_challenge(sid2, lesson.get("lesson", ""))
            if not challenge:
                break
            q = list(challenge.values())[0]
            if q["type"] == "short_answer":
                result = submit_answer(sid2, "I have absolutely no idea", q["correct_answer"], "short_answer")
                check("short_answer: nonsense answer -> is_correct=True",
                      result is not None and result.get("is_correct") is True)
                break

    # Feedback present for both correct and wrong
    challenge = fresh_challenge()
    if challenge:
        q = list(challenge.values())[0]
        result = submit_answer(sid, q["correct_answer"], q["correct_answer"], q["type"])
        check("correct answer response includes feedback", result and bool(result.get("feedback", "").strip()))

    challenge = fresh_challenge()
    if challenge:
        q = list(challenge.values())[0]
        if q["type"] != "short_answer":
            result = submit_answer(sid, "WRONG_ANSWER_XYZ", q["correct_answer"], q["type"])
            check("wrong answer response includes feedback", result and bool(result.get("feedback", "").strip()))

# ==============================================================
# MAIN
# ==============================================================

def print_summary():
    section("FINAL SUMMARY")
    passed = sum(1 for s, _, _ in results if s == "PASS")
    failed = sum(1 for s, _, _ in results if s == "FAIL")
    total = len(results)
    pct = int(100 * passed / total) if total else 0
    print(f"  Passed : {passed}/{total} ({pct}%)")
    print(f"  Failed : {failed}/{total}")
    if failed:
        print("\n  Failed checks:")
        for s, name, detail in results:
            if s == "FAIL":
                print(f"    [FAIL] {name}" + (f" — {detail}" if detail else ""))
    print()

if __name__ == "__main__":
    print("\nLearnFast API Sanity Test Suite")
    print("================================")
    print(f"Target: {BASE}\n")

    # Confirm server is up
    try:
        r = requests.get(f"{BASE}/", timeout=5)
        print(f"Server: {r.json()}")
    except Exception:
        print("ERROR: Server not reachable at", BASE)
        sys.exit(1)

    token = test_auth()
    if not token:
        print("\nFATAL: Could not get auth token. Aborting.")
        sys.exit(1)

    test_session_validation(token)
    test_invalid_sessions()
    test_question_types(token)
    test_languages(token)
    test_adaptive_difficulty(token)
    test_stats_and_reset(token)
    test_answer_edge_cases(token)
    print_summary()
