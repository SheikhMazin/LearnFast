import { useState } from "react";
import { useTranslation } from "react-i18next";

function ShortAnswer({ question, onSubmit }) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base leading-snug font-medium" style={{ color: "var(--ink)" }}>{question}</p>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("question.textareaPlaceholder")}
        rows={4}
        className="paper-textarea w-full px-4 py-3 text-sm"
        autoFocus
      />

      <button
        onClick={() => value.trim() && onSubmit(value.trim())}
        disabled={!value.trim()}
        className="btn-primary w-full py-3 text-sm"
      >
        {t("question.submitAnswer")}
      </button>
    </div>
  );
}

export default ShortAnswer;
