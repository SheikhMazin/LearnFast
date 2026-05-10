import { useState, useRef, useEffect } from "react";

function QADrawer({ thread, topic, onAsk, onClose }) {
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

      <div className="relative w-full max-w-md bg-[#1c1f2e] border-l border-gray-700 flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 flex-shrink-0">
          <div>
            <p className="text-sm font-semibold text-white">Ask a question</p>
            <p className="text-xs text-gray-500 truncate max-w-64">About: {topic}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-lg leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {thread.length === 0 && (
            <p className="text-gray-600 text-sm text-center mt-10">
              Ask anything about this topic.
            </p>
          )}
          {thread.map((entry, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-blue-900/30 border border-blue-800/50 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-500 mb-1">You</p>
                <p className="text-sm text-white">{entry.question}</p>
              </div>
              <div className="bg-[#0f1117] border border-gray-800 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-600 mb-1">{entry.concept || "AI"}</p>
                <p className="text-sm text-gray-300 leading-relaxed">{entry.answer}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="w-4 h-4 rounded-full border-2 border-gray-700 border-t-blue-500 animate-spin" />
              Thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-700 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ask anything..."
            className="flex-1 bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            autoFocus
          />
          <button
            onClick={submit}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-40 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default QADrawer;
