import { useState } from "react";

function LoginPage({ onLogin, onGoToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    if (!password.trim()) e.password = "Password is required";
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setServerError("");
    const ok = await onLogin(email, password);
    if (!ok) setServerError("Invalid email or password");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-title text-5xl mb-1" style={{ color: "var(--green-light)" }}>
            Vernā
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Sign in to continue learning
          </p>
        </div>

        <div className="notebook-card p-8">
          {serverError && (
            <div className="mb-5 px-4 py-2.5 rounded text-sm font-medium"
              style={{ background: "var(--error-bg)", color: "#e88", border: "1px solid var(--error)" }}>
              {serverError}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--ink-muted)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-3 py-2.5 rounded text-sm"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: errors.email ? "1.5px solid var(--error)" : "1.5px solid var(--card-border)",
                  color: "var(--ink)",
                  outline: "none",
                }}
                autoFocus
              />
              {errors.email && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--ink-muted)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-3 py-2.5 rounded text-sm"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: errors.password ? "1.5px solid var(--error)" : "1.5px solid var(--card-border)",
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
              {errors.password && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.password}</p>}
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary w-full py-3 text-sm mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "var(--ink-muted)" }}>
            Don't have an account?{" "}
            <span
              onClick={onGoToSignUp}
              className="cursor-pointer font-semibold hover:underline"
              style={{ color: "var(--green)" }}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
