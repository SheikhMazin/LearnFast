ROLLBACK_THRESHOLD = 3  # consecutive wrong answers on a node before rolling back


def get_current_node(session: dict) -> dict | None:
    curriculum = session.get("curriculum", [])
    idx = session.get("current_node", 0)
    if not curriculum or idx >= len(curriculum):
        return None
    return curriculum[idx]


def record_answer(session: dict, is_correct: bool) -> str:
    """
    Update per-node performance tracking and return the next action.

    Returns one of:
        "advance"             — correct answer, moving to next concept node
        "re_explore"          — wrong answer, staying on same node
        "rollback"            — 3 consecutive wrong, stepping back to prerequisite node
        "curriculum_complete" — correct answer and no more nodes left
        "no_curriculum"       — session has no curriculum (fallback mode)
    """
    curriculum = session.get("curriculum", [])
    if not curriculum:
        return "no_curriculum"

    idx        = session.get("current_node", 0)
    node_stats = session.setdefault("node_stats", {})
    stats      = node_stats.setdefault(
        str(idx), {"attempts": 0, "correct": 0, "consecutive_wrong": 0}
    )

    stats["attempts"] += 1

    if is_correct:
        stats["correct"] += 1
        stats["consecutive_wrong"] = 0

        next_idx = idx + 1
        if next_idx >= len(curriculum):
            curriculum[idx]["status"] = "complete"
            return "curriculum_complete"

        curriculum[idx]["status"] = "complete"
        curriculum[next_idx]["status"] = "in_progress"
        session["current_node"] = next_idx
        node_stats.setdefault(
            str(next_idx), {"attempts": 0, "correct": 0, "consecutive_wrong": 0}
        )
        return "advance"

    else:
        stats["consecutive_wrong"] += 1

        if stats["consecutive_wrong"] >= ROLLBACK_THRESHOLD:
            stats["consecutive_wrong"] = 0
            prereq = curriculum[idx].get("prerequisite")

            if prereq is not None:
                target_idx = max(prereq) if isinstance(prereq, list) else int(prereq)
                # Keep current node open (not failed) — user will return to it
                session["current_node"] = target_idx
                curriculum[target_idx]["status"] = "in_progress"
                # Reset target node so it feels fresh
                node_stats[str(target_idx)] = {
                    "attempts": 0, "correct": 0, "consecutive_wrong": 0
                }
                return "rollback"

        return "re_explore"


def get_curriculum_for_response(session: dict) -> list:
    return session.get("curriculum", [])


def build_node_context(session: dict, action: str) -> dict:
    """
    Build the node_context block included in the /answer response.
    """
    curriculum   = session.get("curriculum", [])
    current_idx  = session.get("current_node", 0)
    prev_idx     = current_idx - 1 if action == "advance" else current_idx

    context = {
        "action":        action,
        "current_node":  current_idx,
        "total_nodes":   len(curriculum),
    }

    if 0 <= prev_idx < len(curriculum):
        context["completed_concept"] = curriculum[prev_idx].get("concept", "")
    if 0 <= current_idx < len(curriculum):
        context["next_concept"] = curriculum[current_idx].get("concept", "")

    if action == "rollback" and 0 <= current_idx < len(curriculum):
        context["rollback_to"] = curriculum[current_idx].get("concept", "")

    return context
