import { StarIcon, FlameIcon } from "../components/Icons";

const DIFF_LABEL = { 1: "Beginner", 2: "Elementary", 3: "Intermediate", 4: "Advanced", 5: "Expert" };

function StatBox({ label, value, icon }) {
  return (
    <div className="notebook-card-plain p-4">
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--ink-muted)" }}>{label}</p>
      <p className="text-xl font-bold flex items-center gap-1.5" style={{ color: "var(--ink)" }}>
        {icon && icon}
        {value}
      </p>
    </div>
  );
}

function CompletionPage({ stats, onNewTopic }) {
  const s = stats || {};
  const accuracy = Math.round((s.accuracy || 0) * 100);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "var(--bg)" }}>
      <div className="flex items-center gap-2 mb-4" style={{ color: "var(--green-light)" }}>
        <StarIcon className="w-8 h-8" />
        <StarIcon className="w-10 h-10" />
        <StarIcon className="w-8 h-8" />
      </div>
      <h1 className="font-title text-4xl mb-2" style={{ color: "var(--text)" }}>Curriculum Complete!</h1>
      <p className="mb-10 text-base" style={{ color: "var(--text-muted)" }}>
        You mastered{" "}
        <span className="font-semibold" style={{ color: "var(--green-light)" }}>{s.topic}</span>{" "}
        in {s.language}
      </p>

      <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-8">
        <StatBox label="Questions" value={s.questions_answered ?? "—"} />
        <StatBox label="Accuracy" value={`${accuracy}%`} />
        <StatBox
          label="Best Streak"
          value={s.current_streak ?? 0}
          icon={<FlameIcon className="w-4 h-4" style={{ color: "var(--warning)" }} />}
        />
        <StatBox label="Final Level" value={DIFF_LABEL[s.current_difficulty] ?? s.current_difficulty ?? "—"} />
        <StatBox label="Avg Time" value={`${(s.avg_time_seconds || 0).toFixed(1)}s`} />
        <StatBox label="Correct" value={`${s.total_correct ?? 0} / ${s.questions_answered ?? 0}`} />
      </div>

      <button
        onClick={onNewTopic}
        className="btn-primary w-full max-w-md py-3.5 text-base font-semibold"
      >
        Start a New Topic
      </button>
    </div>
  );
}

export default CompletionPage;
