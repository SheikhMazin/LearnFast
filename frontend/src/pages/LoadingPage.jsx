function LoadingPage({ topic, isResume }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "var(--bg)" }}>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: "var(--border)" }} />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
          style={{ borderTopColor: "var(--green-light)" }}
        />
      </div>
      <div className="text-center">
        <h2 className="font-title text-3xl mb-2" style={{ color: "var(--text)" }}>
          {isResume ? "Resuming your session" : "Building your curriculum"}
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {isResume ? (
            <>
              Loading your previous work on{" "}
              <span className="font-semibold" style={{ color: "var(--green-light)" }}>{topic}</span>...
            </>
          ) : (
            <>
              Generating a personalised lesson on{" "}
              <span className="font-semibold" style={{ color: "var(--green-light)" }}>{topic}</span>...
            </>
          )}
        </p>
      </div>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: "var(--green)", animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default LoadingPage;
