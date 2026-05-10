import { useState } from "react";
import { useTranslation } from "react-i18next";

function Ordering({ question, items, onSubmit }) {
  const { t } = useTranslation();
  const [order, setOrder] = useState(() => (items || []).map((text, i) => ({ id: i, text })));
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const onDragStart = (idx) => setDragging(idx);
  const onDragOver = (e, idx) => { e.preventDefault(); setDragOver(idx); };
  const onDrop = (targetIdx) => {
    if (dragging === null || dragging === targetIdx) return;
    const next = [...order];
    const [moved] = next.splice(dragging, 1);
    next.splice(targetIdx, 0, moved);
    setOrder(next);
    setDragging(null);
    setDragOver(null);
  };
  const onDragEnd = () => { setDragging(null); setDragOver(null); };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base leading-snug font-medium" style={{ color: "var(--ink)" }}>{question}</p>
      <p className="text-xs" style={{ color: "var(--ink-muted)" }}>{t("question.dragInstruction")}</p>

      <div className="flex flex-col gap-2">
        {order.map((item, idx) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={(e) => onDragOver(e, idx)}
            onDrop={() => onDrop(idx)}
            onDragEnd={onDragEnd}
            className="flex items-center gap-3 px-3 py-3 cursor-grab active:cursor-grabbing select-none transition-all"
            style={{
              background: dragOver === idx ? "#eef5e8" : dragging === idx ? "var(--card-2)" : "var(--card)",
              border: dragOver === idx ? "1.5px solid var(--green)" : "1.5px solid var(--card-border)",
              borderRadius: "4px 10px 8px 4px / 5px 4px 10px 5px",
              opacity: dragging === idx ? 0.45 : 1,
            }}
          >
            <span className="text-sm select-none" style={{ color: "var(--card-border)", letterSpacing: "0.05em" }}>&#8942;&#8942;</span>
            <span
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "var(--card-2)", border: "1px solid var(--card-border)", color: "var(--ink-muted)" }}
            >
              {idx + 1}
            </span>
            <span className="text-sm" style={{ color: "var(--ink)" }}>{item.text}</span>
          </div>
        ))}
      </div>

      <button onClick={() => onSubmit(order.map((item) => item.id + 1).join(","))} className="btn-primary w-full py-3 text-sm">
        {t("question.submitOrder")}
      </button>
    </div>
  );
}

export default Ordering;
