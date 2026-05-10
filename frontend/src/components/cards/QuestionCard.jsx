import { useRef } from "react";
import { FlameIcon } from "../Icons";
import MultipleChoice from "../questions/MultipleChoice";
import FillBlank from "../questions/FillBlank";
import TrueFalse from "../questions/TrueFalse";
import ShortAnswer from "../questions/ShortAnswer";
import Ordering from "../questions/Ordering";

const DIFF_LABEL = { 1: "Beginner", 2: "Elementary", 3: "Intermediate", 4: "Advanced", 5: "Expert" };

function QuestionCard({ data, onAnswer, stats, isReadOnly }) {
  const { question, options, items, correct_answer, question_type } = data;
  const startTimeRef = useRef(Date.now());

  const handleSubmit = (userAnswer) => {
    if (isReadOnly) return;
    onAnswer(userAnswer, correct_answer, question_type, startTimeRef.current);
  };

  const renderInput = () => {
    if (isReadOnly) {
      return (
        <p className="text-sm text-center py-8" style={{ color: "var(--ink-muted)" }}>
          Answer already submitted — navigate forward to resume.
        </p>
      );
    }
    switch (question_type) {
      case "multiple_choice":
        return <MultipleChoice question={question} options={options} onSubmit={handleSubmit} />;
      case "fill_blank":
        return <FillBlank question={question} onSubmit={handleSubmit} />;
      case "true_false":
        return <TrueFalse question={question} onSubmit={handleSubmit} />;
      case "short_answer":
        return <ShortAnswer question={question} onSubmit={handleSubmit} />;
      case "ordering":
        return <Ordering question={question} items={items} onSubmit={handleSubmit} />;
      default:
        return <MultipleChoice question={question} options={options || []} onSubmit={handleSubmit} />;
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <span
            className="px-2.5 py-0.5 text-xs capitalize"
            style={{
              background: "#dff0d4",
              border: "1px solid var(--green)",
              color: "var(--green)",
              borderRadius: "3px 8px 6px 3px / 4px 3px 8px 4px",
            }}
          >
            {question_type?.replace(/_/g, " ")}
          </span>
          {stats?.difficulty && (
            <span
              className="px-2.5 py-0.5 text-xs"
              style={{
                background: "var(--card-2)",
                border: "1px solid var(--card-border)",
                color: "var(--ink-muted)",
                borderRadius: "3px 8px 6px 3px / 4px 3px 8px 4px",
              }}
            >
              {DIFF_LABEL[stats.difficulty]}
            </span>
          )}
        </div>
        {stats && (
          <span className="text-sm flex-shrink-0 flex items-center gap-1" style={{ color: "var(--warning)" }}>
            <FlameIcon className="w-3.5 h-3.5" />
            {stats.streak}
          </span>
        )}
      </div>
      {renderInput()}
    </div>
  );
}

export default QuestionCard;
