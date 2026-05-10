import { useState } from "react";

const inputCls =
  "w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900";

function Field({ label, type, value, onChange, error }) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <input type={type} value={value} onChange={onChange} className={inputCls} />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-gray-900">LearnFast</h1>
          <p className="text-sm text-gray-400 mt-1">Create your account</p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 mb-4">
            {serverError}
          </div>
        )}

        <div className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={setField("email")} error={errors.email} />
          <Field label="Password" type="password" value={password} onChange={setField("password")} error={errors.password} />
          <Field label="Confirm password" type="password" value={confirm} onChange={setField("confirm")} error={errors.confirm} />

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full text-sm py-2.5 rounded-lg bg-gray-900 text-white font-medium mt-2 disabled:opacity-50 hover:bg-gray-800 transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?{" "}
          <span onClick={onGoToLogin} className="text-gray-700 cursor-pointer hover:underline">
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
