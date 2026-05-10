import { useState } from "react";

function SignUpPage({ onSignUp, onGoToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    if (!password.trim()) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    if (confirm !== password) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSignUp = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setServerError("");
    const ok = await onSignUp(email, password);
    if (!ok) setServerError("Signup failed. Email may already be in use.");
    setLoading(false);
  };

  const setField = (key) => (ev) => {
    const val = ev.target.value;
    setErrors((p) => ({ ...p, [key]: "" }));
    if (key === "email") setEmail(val);
    if (key === "password") setPassword(val);
    if (key === "confirm") setConfirm(val);
  };

  const inputStyle = (hasError) => ({
    background: "rgba(255,255,255,0.6)",
    border: hasError ? "1.5px solid var(--error)" : "1.5px solid var(--card-border)",
    color: "var(--ink)",
    outline: "none",
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-title text-5xl mb-1" style={{ color: "var(--green-light)" }}>
            Vernā
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Create your account
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
                onChange={setField("email")}
                onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                className="w-full px-3 py-2.5 rounded text-sm"
                style={inputStyle(errors.email)}
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
                onChange={setField("password")}
                onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                className="w-full px-3 py-2.5 rounded text-sm"
                style={inputStyle(errors.password)}
              />
              {errors.password && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--ink-muted)" }}>
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={setField("confirm")}
                onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                className="w-full px-3 py-2.5 rounded text-sm"
                style={inputStyle(errors.confirm)}
              />
              {errors.confirm && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.confirm}</p>}
            </div>

            <button
              onClick={handleSignUp}
              disabled={loading}
              className="btn-primary w-full py-3 text-sm mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "var(--ink-muted)" }}>
            Already have an account?{" "}
            <span
              onClick={onGoToLogin}
              className="cursor-pointer font-semibold hover:underline"
              style={{ color: "var(--green)" }}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
