import { useState } from "react";

function Ordering({ question, items, onSubmit }) {
  const [order, setOrder] = useState(
    () => (items || []).map((text, i) => ({ id: i, text }))
  );
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

  const handleSubmit = () => {
    onSubmit(order.map((item) => item.id + 1).join(","));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-white text-base leading-snug font-medium">{question}</p>
      <p className="text-xs text-gray-600">Drag the steps into the correct order</p>

      <div className="flex flex-col gap-2">
        {order.map((item, idx) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={(e) => onDragOver(e, idx)}
            onDrop={() => onDrop(idx)}
            onDragEnd={onDragEnd}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl border cursor-grab active:cursor-grabbing select-none transition-all ${
              dragOver === idx
                ? "border-blue-500 bg-blue-900/20"
                : dragging === idx
                ? "border-gray-600 opacity-40"
                : "border-gray-700/80 bg-[#0f1117] hover:border-gray-600"
            }`}
          >
            <span className="text-gray-700 text-sm select-none">⠿</span>
            <span className="w-6 h-6 rounded-md bg-gray-800 border border-gray-700 text-gray-400 text-xs flex items-center justify-center flex-shrink-0 font-bold">
              {idx + 1}
            </span>
            <span className="text-sm text-gray-300">{item.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 rounded-xl border border-gray-600 text-white font-medium hover:bg-white hover:text-black transition-all text-sm"
      >
        Submit order
      </button>
    </div>
  );
}

export default Ordering;
