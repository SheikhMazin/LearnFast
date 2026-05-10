import { useRef } from "react";
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
        <p className="text-gray-600 text-sm text-center py-8">
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
          <span className="px-2.5 py-0.5 rounded-full bg-purple-900/40 border border-purple-800/60 text-purple-300 text-xs capitalize">
            {question_type?.replace(/_/g, " ")}
          </span>
          {stats?.difficulty && (
            <span className="px-2.5 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-500 text-xs">
              {DIFF_LABEL[stats.difficulty]}
            </span>
          )}
        </div>
        {stats && (
          <span className="text-orange-400 text-sm flex-shrink-0">🔥 {stats.streak}</span>
        )}
      </div>
      {renderInput()}
    </div>
  );
}

export default QuestionCard;
