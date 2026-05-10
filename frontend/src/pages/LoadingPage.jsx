function LoadingPage({ topic }) {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex flex-col items-center justify-center gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Building your curriculum</h2>
        <p className="text-gray-400 text-sm">
          Generating a personalised lesson on{" "}
          <span className="text-white font-medium">{topic}</span>...
        </p>
      </div>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default LoadingPage;
