const STATUS_STYLES = {
  complete:     { icon: "✓", cls: "text-emerald-400 border-emerald-700/60 bg-emerald-900/20" },
  in_progress:  { icon: "▶", cls: "text-blue-400 border-blue-700/60 bg-blue-900/20" },
  locked:       { icon: "○", cls: "text-gray-700 border-gray-800 bg-transparent" },
  rolled_back:  { icon: "↩", cls: "text-amber-400 border-amber-700/60 bg-amber-900/20" },
};

function CurriculumMap({ curriculum, topic }) {
  if (!curriculum || curriculum.length === 0) return null;

  return (
    <aside className="w-52 flex-shrink-0 border-r border-gray-800 py-6 px-4 hidden lg:flex flex-col">
      <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Curriculum</p>
      <p className="text-sm font-semibold text-white mb-5 truncate">{topic}</p>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {curriculum.map((node) => {
          const status = node.status || "locked";
          const { icon, cls } = STATUS_STYLES[status] || STATUS_STYLES.locked;
          return (
            <div
              key={node.id}
              className={`flex items-start gap-2 px-2.5 py-2 rounded-lg border text-xs transition-all ${cls}`}
            >
              <span className="flex-shrink-0 font-bold mt-0.5">{icon}</span>
              <span className="leading-snug">{node.concept}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-600">
          {curriculum.filter((n) => n.status === "complete").length} /{" "}
          {curriculum.length} complete
        </p>
      </div>
    </aside>
  );
}

export default CurriculumMap;
