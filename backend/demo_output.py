#!/usr/bin/env python3
"""
LearnFast — Interactive Terminal Chatbot
"""

import sys, io, os, getpass, textwrap, requests, time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE = "http://localhost:5000"
W    = 68

LANGUAGES = [
    "English", "Spanish", "French", "Mandarin",
    "Arabic",  "Hindi",   "Portuguese", "Swahili",
]

DIFF_LABEL = {1: "Beginner", 2: "Elementary", 3: "Intermediate",
              4: "Advanced", 5: "Expert"}

FACT_TAG_ICONS = {
    "Key term":              "[KEY]",
    "Did you know":          "[DYK]",
    "Common misconception":  "[MYTH]",
    "Real-world link":       "[REAL]",
}

# ── terminal helpers ──────────────────────────────────────────

def clr():
    os.system("cls" if os.name == "nt" else "clear")

def rule(ch="─", n=W): print(ch * n)

def banner(title=""):
    clr()
    print("+" + "=" * (W - 2) + "+")
    print("|" + " LearnFast  *  AI Adaptive Learning ".center(W - 2) + "|")
    print("+" + "=" * (W - 2) + "+")
    if title:
        print(f"\n  {title}")
    print()

def box(title):
    print(); rule(); print(f"  {title}"); rule()

def para(text, indent=2):
    pad = " " * indent
    for line in text.splitlines():
        if line.strip():
            print(textwrap.fill(line.strip(), W,
                                initial_indent=pad, subsequent_indent=pad))
        else:
            print()

def prompt(msg=""):
    return input(f"  {msg}> ").strip()

def pause(msg="Press Enter to continue..."):
    input(f"\n  {msg}")

# ── API calls ─────────────────────────────────────────────────

def _post(path, body=None, token=None):
    h = {"Authorization": f"Bearer {token}"} if token else {}
    try:
        return requests.post(f"{BASE}{path}", json=body, headers=h, timeout=90)
    except requests.exceptions.ConnectionError:
        print("\n  ERROR: Cannot reach server. Is app.py running?\n")
        sys.exit(1)

def _get(path, token=None):
    h = {"Authorization": f"Bearer {token}"} if token else {}
    try:
        return requests.get(f"{BASE}{path}", headers=h, timeout=30)
    except requests.exceptions.ConnectionError:
        print("\n  ERROR: Cannot reach server.\n")
        sys.exit(1)

# ── Auth ──────────────────────────────────────────────────────

def screen_auth():
    while True:
        banner("Welcome! Please log in or create an account.")
        print("  [1]  Log in to existing account")
        print("  [2]  Create a new account")
        print("  [q]  Quit")
        ch = prompt()

        if ch == "q":
            sys.exit(0)

        if ch not in ("1", "2"):
            continue

        email    = prompt("Email: ")
        password = getpass.getpass("  Password: ")

        if ch == "2":
            r = _post("/auth/signup", {"email": email, "password": password})
            if r.status_code != 201:
                print(f"\n  Could not create account: {r.json().get('message', '')}")
                pause("Press Enter to try again...")
                continue
            print("\n  Account created.")

        r = _post("/auth/login", {"email": email, "password": password})
        if r.status_code != 200:
            print(f"\n  Login failed: {r.json().get('message', 'invalid credentials')}")
            pause("Press Enter to try again...")
            continue

        token = r.json()["access_token"]
        print(f"\n  Logged in as {email}")
        time.sleep(0.8)
        return token

# ── Session setup ─────────────────────────────────────────────

def screen_setup(token):
    while True:
        banner("SESSION SETUP")

        print("  Pick a language:\n")
        for i, lang in enumerate(LANGUAGES, 1):
            print(f"    [{i}]  {lang}")
        print()
        ch = prompt()
        if not (ch.isdigit() and 1 <= int(ch) <= len(LANGUAGES)):
            continue
        language = LANGUAGES[int(ch) - 1]

        print(f"\n  What topic would you like to learn about?")
        topic = prompt()
        if not topic:
            topic = "photosynthesis"

        print(f"\n  Starting difficulty  1 (Beginner) -> 5 (Expert)  [default 2]:")
        d = prompt()
        difficulty = int(d) if d.isdigit() and 1 <= int(d) <= 5 else 2

        print("\n  Building curriculum and starting session...", end="", flush=True)
        r = _post("/session/start",
                  {"language": language, "topic": topic, "difficulty": difficulty},
                  token=token)
        print("\r" + " " * 50 + "\r", end="")

        if r.status_code != 201:
            print(f"  Error: {r.json()}")
            pause()
            continue

        data = r.json()

        # Show curriculum map if generated
        curriculum = data.get("curriculum", [])
        if curriculum:
            banner("CURRICULUM MAP")
            print(f"  Topic: {topic}  ({language})")
            print(f"  {len(curriculum)} concept nodes to master\n")
            for node in curriculum:
                status = node.get("status", "locked")
                marker = "[>]" if status == "in_progress" else "[ ]"
                concept = node.get("concept", "")
                prereq  = node.get("prerequisite")
                indent  = "      " if prereq is not None else "  "
                print(f"{indent}{marker} {node['id'] + 1}. {concept}")
            pause("Press Enter to begin learning...")

        return data

# ── HUD (heads-up stats line) ─────────────────────────────────

def _print_hud(session, q_num=None):
    diff    = session.get("current_difficulty", 2)
    label   = DIFF_LABEL.get(diff, "")
    streak  = session.get("current_streak", 0)
    acc     = session.get("accuracy", 0)
    qans    = session.get("questions_answered", 0)
    correct = session.get("total_correct", 0)
    topic   = session.get("topic", "")
    lang    = session.get("language", "")
    cur_n   = session.get("current_node", 0)
    total_n = session.get("total_nodes", 0)

    q_tag   = f"Q{q_num}  |  " if q_num else ""
    node_tag = f"  |  Node {cur_n + 1}/{total_n}" if total_n else ""

    print(f"  {q_tag}{topic.title()}  ({lang}){node_tag}")
    print(f"  Difficulty: {diff}/5 [{label}]  |  "
          f"Streak: {streak}  |  "
          f"Correct: {correct}/{qans}  |  "
          f"Accuracy: {acc:.0%}")
    print()

# ── Curriculum progress bar ───────────────────────────────────

def _print_progress(session):
    curriculum = session.get("curriculum", [])
    if not curriculum:
        return
    cur_node = session.get("current_node", 0)
    bar_parts = []
    for node in curriculum:
        status = node.get("status", "locked")
        if status == "complete":
            bar_parts.append("[#]")
        elif status == "in_progress":
            bar_parts.append("[>]")
        else:
            bar_parts.append("[ ]")
    print("  Progress: " + " ".join(bar_parts))
    # Show current concept name
    if 0 <= cur_node < len(curriculum):
        concept = curriculum[cur_node].get("concept", "")
        print(f"  Now:      {concept}")
    print()

# ── Lesson ────────────────────────────────────────────────────

def screen_lesson(session):
    banner()
    _print_hud(session)
    _print_progress(session)

    print("  Fetching lesson...", end="", flush=True)
    r = _post("/lesson", {"session_id": session["session_id"]})
    print("\r" + " " * 30 + "\r", end="")

    lesson = r.json()
    concept = lesson.get("concept", "")
    box(f"LESSON  —  {concept}" if concept else "LESSON")
    print()
    para(lesson["lesson"].strip())
    print()
    pause("Press Enter when you're ready for your first question...")
    return lesson.get("lesson", "")

# ── Flashcard ─────────────────────────────────────────────────

def screen_flashcard(session, concept_override=None):
    """Fetch and display a single flashcard for the current concept."""
    print("\n  Loading flashcard...", end="", flush=True)
    r = _post("/flashcard", {"session_id": session["session_id"]})
    print("\r" + " " * 30 + "\r", end="")

    if r.status_code != 200 or "error" in r.json():
        return  # silently skip if flashcard fails

    card    = r.json()
    front   = card.get("front", "")
    back    = card.get("back", "")
    tag     = card.get("fact_tag", "")
    concept = card.get("concept", concept_override or "")
    icon    = FACT_TAG_ICONS.get(tag, f"[{tag}]")

    print()
    rule("*")
    print(f"  {icon}  FLASHCARD  —  {concept}")
    rule("*")
    print()
    para(front)
    pause("Press Enter to flip the card...")
    print()
    rule("-")
    para(back)
    rule("-")
    print()
    pause("Press Enter to continue to your next question...")

# ── Q&A drawer ────────────────────────────────────────────────

def screen_ask(session):
    """Let the user ask a freeform question about the current concept."""
    banner()
    _print_hud(session)
    curriculum = session.get("curriculum", [])
    cur_node   = session.get("current_node", 0)
    concept    = ""
    if curriculum and cur_node < len(curriculum):
        concept = curriculum[cur_node].get("concept", "")

    if concept:
        print(f"  Current concept: {concept}\n")
    print("  Ask anything about this topic. (Leave blank to cancel.)\n")

    question = prompt("Your question")
    if not question:
        return

    print("\n  Thinking...", end="", flush=True)
    r = _post("/ask", {"session_id": session["session_id"], "question": question})
    print("\r" + " " * 20 + "\r", end="")

    if r.status_code != 200 or "error" in r.json():
        print(f"\n  Could not get an answer: {r.json()}")
        pause()
        return

    result = r.json()
    box("ANSWER")
    print()
    para(result.get("answer", "").strip())
    print()
    pause()

# ── Question ──────────────────────────────────────────────────

def screen_question(challenge, q_num, session):
    key    = list(challenge.keys())[0]
    q      = challenge[key]
    qtype  = q.get("type", key)

    banner()
    _print_hud(session, q_num)
    _print_progress(session)
    box(f"QUESTION  [{qtype.replace('_', ' ').upper()}]")
    print()
    para(q.get("question", "").strip())
    print()

    if qtype == "multiple_choice":
        for opt in q.get("options", []):
            if opt.strip():
                print(f"      {opt.strip()}")
        print()
        print("  Your answer — type A, B, C or D:")

    elif qtype == "fill_blank":
        print("  Type the missing word or phrase:")

    elif qtype == "true_false":
        print("  Type  true  or  false:")

    elif qtype == "short_answer":
        print("  Write your answer (1-2 sentences):")

    elif qtype == "ordering":
        items = q.get("items", [])
        if items:
            print("  Steps to order:\n")
            for item in items:
                print(f"      {item}")
            print()
        print("  Type the correct order as comma-separated numbers  (e.g. 3,1,4,2):")

    print()
    print("  Commands: [a]sk  [s]tats  [n]ew topic  [r]eset  [q]uit")
    return q, qtype

# ── Feedback ──────────────────────────────────────────────────

def screen_feedback(result, prev_diff, user_ans, correct_ans):
    is_correct  = result.get("is_correct", False)
    sess        = result.get("session", {})
    curr_diff   = sess.get("current_difficulty", prev_diff)
    next_action = result.get("next_action", "")
    node_ctx    = result.get("node_context", {})

    print()
    rule("─")
    if is_correct:
        print("\n  CORRECT!\n")
    else:
        print(f"\n  WRONG — the answer was:  {correct_ans}\n")

    box("FEEDBACK")
    print()
    para(result.get("feedback", "").strip())
    print()

    if curr_diff > prev_diff:
        print(f"  ** LEVEL UP!  Difficulty {prev_diff} -> {curr_diff} ({DIFF_LABEL[curr_diff]}) **\n")
    elif curr_diff < prev_diff:
        print(f"  Difficulty adjusted: {prev_diff} -> {curr_diff} ({DIFF_LABEL[curr_diff]})\n")

    print(f"  Streak: {sess.get('current_streak')}  |  "
          f"Accuracy: {sess.get('accuracy', 0):.0%}  |  "
          f"Difficulty: {curr_diff}/5")

    # Show curriculum transition message
    if next_action == "advance":
        completed = node_ctx.get("completed_concept", "")
        nxt       = node_ctx.get("next_concept", "")
        print()
        rule("=")
        print(f"\n  Concept mastered: {completed}")
        if nxt:
            print(f"  Moving on to:     {nxt}")
        rule("=")

    elif next_action == "rollback":
        rollback_to = node_ctx.get("rollback_to", "")
        print()
        rule("-")
        print(f"\n  Let's revisit the foundation: {rollback_to}")
        print("  We'll come back to this concept once you're comfortable.")
        rule("-")

    elif next_action == "curriculum_complete":
        completed = node_ctx.get("completed_concept", "")
        print()
        rule("*")
        print(f"\n  CURRICULUM COMPLETE!")
        if completed:
            print(f"  Final concept mastered: {completed}")
        print("  You've worked through every node in this curriculum!")
        rule("*")

    return curr_diff, sess, next_action, node_ctx

# ── Stats screen ──────────────────────────────────────────────

def screen_stats(session, token):
    r = _get(f"/session/{session['session_id']}/stats", token=token)
    if r.status_code != 200:
        print("  Could not load stats.")
        pause()
        return

    s = r.json()
    banner("SESSION STATS")
    rule()
    print(f"  Topic          {s.get('topic', '')}")
    print(f"  Language       {s.get('language', '')}")
    rule()
    print(f"  Questions      {s.get('questions_answered', 0)}")
    print(f"  Correct        {s.get('total_correct', 0)}")
    print(f"  Accuracy       {s.get('accuracy', 0):.0%}")
    print(f"  Current streak {s.get('current_streak', 0)}")
    print(f"  Difficulty     {s.get('current_difficulty', 0)}/5  "
          f"[{DIFF_LABEL.get(s.get('current_difficulty', 2), '')}]")
    print(f"  Confidence     {s.get('confidence_score', 0):.2f}")
    print(f"  Avg time       {s.get('avg_time_seconds', 0):.1f}s / question")

    # Show curriculum progress if available
    curriculum = session.get("curriculum", [])
    if curriculum:
        rule()
        print(f"  Curriculum progress  ({session.get('current_node', 0) + 1}/{len(curriculum)} nodes):\n")
        for node in curriculum:
            status  = node.get("status", "locked")
            marker  = "[#]" if status == "complete" else "[>]" if status == "in_progress" else "[ ]"
            concept = node.get("concept", "")
            print(f"    {marker} {node['id'] + 1}. {concept}")

    rule()
    pause()

# ── Game loop ─────────────────────────────────────────────────

def game_loop(token, session, lesson_ctx):
    """
    Returns: "quit" | "new_topic" | "reset"
    """
    q_num     = session.get("questions_answered", 0)
    prev_diff = session["current_difficulty"]
    sid       = session["session_id"]

    while True:
        # Fetch challenge
        print("\n  Fetching question...", end="", flush=True)
        r = _post("/challenge", {"session_id": sid, "lesson_context": lesson_ctx})
        print("\r" + " " * 30 + "\r", end="")

        if r.status_code != 200 or "error" in r.json():
            print(f"\n  Could not generate question: {r.json()}")
            pause()
            continue

        q_num += 1
        challenge = r.json()
        q, qtype  = screen_question(challenge, q_num, session)

        # Get answer
        while True:
            user_ans = prompt()
            if user_ans:
                break
            print("  Please enter something.")

        # Built-in commands
        cmd = user_ans.lower()
        if cmd in ("q", "quit", "exit"):
            return "quit"
        if cmd in ("s", "stats"):
            screen_stats(session, token)
            q_num -= 1
            continue
        if cmd in ("a", "ask"):
            screen_ask(session)
            q_num -= 1
            continue
        if cmd in ("n", "new", "new topic"):
            return "new_topic"
        if cmd in ("r", "reset"):
            _post(f"/session/{sid}/reset", token=token)
            print("\n  Session reset.")
            return "reset"

        # Submit answer
        r2 = _post("/answer", {
            "session_id":         sid,
            "user_answer":        user_ans,
            "correct_answer":     q["correct_answer"],
            "question_type":      qtype,
            "time_taken_seconds": 15.0,
        })

        if r2.status_code != 200:
            print(f"\n  Error: {r2.json()}")
            pause()
            continue

        result = r2.json()
        prev_diff, updated, next_action, node_ctx = screen_feedback(
            result, prev_diff, user_ans, q["correct_answer"]
        )

        # Sync local session state — including curriculum from node_context
        session.update({
            "current_difficulty": prev_diff,
            "current_streak":     updated.get("current_streak", 0),
            "accuracy":           updated.get("accuracy", 0),
            "questions_answered": updated.get("questions_answered", q_num),
            "total_correct":      updated.get("total_correct", 0),
            "total_nodes":        updated.get("total_nodes", session.get("total_nodes", 0)),
        })
        if node_ctx.get("current_node") is not None:
            session["current_node"] = node_ctx["current_node"]
            # Sync curriculum node statuses from server-side session via node_ctx
            curriculum = session.get("curriculum", [])
            if curriculum and next_action in ("advance", "rollback"):
                _sync_curriculum_statuses(session, next_action, node_ctx)

        # Curriculum complete — offer new topic
        if next_action == "curriculum_complete":
            pause("Press Enter to pick a new topic...")
            return "new_topic"

        # Show flashcard on concept transition
        if next_action in ("advance", "rollback"):
            print()
            print("  [Enter] show flashcard  [skip] go straight to next question")
            fc_cmd = prompt().lower()
            if fc_cmd not in ("skip", "s"):
                screen_flashcard(session)
            # Re-fetch the lesson for the new concept
            print("\n  Fetching new lesson...", end="", flush=True)
            lr = _post("/lesson", {"session_id": sid})
            print("\r" + " " * 30 + "\r", end="")
            if lr.status_code == 200 and "lesson" in lr.json():
                lesson_data = lr.json()
                new_concept = lesson_data.get("concept", "")
                box(f"LESSON  —  {new_concept}" if new_concept else "LESSON")
                print()
                para(lesson_data["lesson"].strip())
                print()
                lesson_ctx = lesson_data["lesson"]
                pause("Press Enter for your next question...")
            continue

        # Between-question prompt
        print()
        print("  [Enter] next question  [a]sk  [n] new topic  [s] stats  [r] reset  [q] quit")
        cmd = prompt().lower()

        if cmd == "q":
            return "quit"
        if cmd == "n":
            return "new_topic"
        if cmd == "r":
            _post(f"/session/{sid}/reset", token=token)
            print("\n  Session reset.")
            return "reset"
        if cmd == "s":
            screen_stats(session, token)
        if cmd == "a":
            screen_ask(session)


def _sync_curriculum_statuses(session, next_action, node_ctx):
    """Keep the local curriculum list statuses in sync after a node transition."""
    curriculum   = session.get("curriculum", [])
    current_node = session.get("current_node", 0)

    for node in curriculum:
        nid = node["id"]
        if next_action == "advance":
            prev_node = current_node - 1
            if nid == prev_node:
                node["status"] = "complete"
            elif nid == current_node:
                node["status"] = "in_progress"
        elif next_action == "rollback":
            if nid == current_node:
                node["status"] = "in_progress"

# ── Main ──────────────────────────────────────────────────────

def main():
    try:
        requests.get(f"{BASE}/", timeout=5)
    except Exception:
        print(f"\n  ERROR: Cannot reach {BASE}")
        print("  Start the server first:  python app.py\n")
        sys.exit(1)

    token = screen_auth()

    while True:
        session     = screen_setup(token)
        lesson_ctx  = screen_lesson(session)

        while True:
            action = game_loop(token, session, lesson_ctx)

            if action == "quit":
                banner("Thanks for learning with LearnFast!")
                sys.exit(0)

            elif action == "new_topic":
                break  # back to setup_session

            elif action == "reset":
                lesson_ctx = screen_lesson(session)


if __name__ == "__main__":
    main()
