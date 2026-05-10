import { useState } from "react";

const BASE_URL = "https://learnfast-1.onrender.com";

export function useAuth() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");
    if (token && userId) {
      return { id: userId, token };
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Invalid credentials");
        return false;
      }
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_id", data.user_id);
      setUser({ id: data.user_id, token: data.access_token });
      return true;
    } catch (err) {
      setError("Could not connect to server");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Signup failed");
        return false;
      }
      return true;
    } catch (err) {
      setError("Could not connect to server");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch(`${BASE_URL}/auth/logout`, { method: "POST" });
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    setUser(null);
  };

  return { user, loading, error, login, signup, logout };
}
