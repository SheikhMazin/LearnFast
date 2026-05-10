import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { XIcon } from "./Icons";

function QADrawer({ thread, topic, onAsk, onClose }) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread, loading]);

  const submit = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setLoading(true);
    await onAsk(q);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className="relative w-full max-w-md flex flex-col h-full shadow-2xl"
        style={{ background: "var(--card)", borderLeft: "3px solid var(--card-margin)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--card-line)" }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{t("qa.header")}</p>
            <p className="text-xs truncate max-w-64" style={{ color: "var(--ink-muted)" }}>{t("qa.about", { topic })}</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded transition-colors"
            style={{ color: "var(--ink-muted)" }}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {thread.length === 0 && (
            <p className="text-sm text-center mt-10" style={{ color: "var(--ink-muted)" }}>
              {t("qa.empty")}
            </p>
          )}
          {thread.map((entry, i) => (
            <div key={i} className="space-y-2">
              <div
                className="px-4 py-3 rounded"
                style={{
                  background: "var(--green-muted)",
                  border: "1px solid var(--green-dark)",
                  borderRadius: "4px 12px 8px 4px / 6px 4px 12px 6px",
                }}
              >
                <p className="text-xs mb-1 font-semibold" style={{ color: "var(--green-light)" }}>{t("qa.you")}</p>
                <p className="text-sm" style={{ color: "#e8f4e0" }}>{entry.question}</p>
              </div>
              <div
                className="px-4 py-3"
                style={{
                  background: "var(--card-2)",
                  border: "1px solid var(--card-line)",
                  borderLeft: "3px solid var(--green)",
                  borderRadius: "3px 8px 6px 3px / 4px 3px 8px 4px",
                }}
              >
                <p className="text-xs mb-1" style={{ color: "var(--ink-muted)" }}>{entry.concept || "Tutor"}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>{entry.answer}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-muted)" }}>
              <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--green)" }} />
              {t("qa.thinking")}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-3 px-5 py-4 flex-shrink-0" style={{ borderTop: "1px solid var(--card-line)" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={t("qa.placeholder")}
            className="flex-1 px-4 py-2.5 text-sm rounded"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1.5px solid var(--card-border)",
              color: "var(--ink)",
              outline: "none",
            }}
            autoFocus
          />
          <button onClick={submit} disabled={loading || !input.trim()} className="btn-primary px-4 py-2.5 text-sm">
            {t("qa.send")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QADrawer;
