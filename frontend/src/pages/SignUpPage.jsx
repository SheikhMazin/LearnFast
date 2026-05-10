import { useState } from "react";

function SignUpPage({ onSignUp, onGoToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!confirm.trim()) newErrors.confirm = "Please confirm your password";
    else if (confirm !== password) newErrors.confirm = "Passwords do not match";
    return newErrors;
  };

  const handleSignUp = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    setServerError("");
    const success = await onSignUp(email, password);
    if (!success) setServerError("Signup failed. Email may already be in use.");
    setLoading(false);
  };

  const field = (label, type, placeholder, value, setter, errorKey) => (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => { setter(e.target.value); setErrors(p => ({ ...p, [errorKey]: "" })); }}
        className={`w-full text-sm px-3 py-2 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 ...`}       />
      {errors[errorKey] && <p className="text-xs text-red-400 mt-1">{errors[errorKey]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-sm">

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
          {field("Full name", "text", "John Doe", name, setName, "name")}
          {field("Email", "email", "you@example.com", email, setEmail, "email")}
          {field("Password", "password", "••••••••", password, setPassword, "password")}
          {field("Confirm password", "password", "••••••••", confirm, setConfirm, "confirm")}

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full text-sm py-2.5 rounded-lg bg-gray-900 text-white font-medium mt-2 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?{" "}
          <span onClick={onGoToLogin} className="text-gray-700 cursor-pointer hover:underline">Sign in</span>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
