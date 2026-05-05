import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const API = "http://127.0.0.1:8000";

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("ss_user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("ss_token") || null);

  async function login(email, password) {
    try {
      const res  = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("ss_user",  JSON.stringify(data.user));
        localStorage.setItem("ss_token", data.token);
      }
      return data;
    } catch {
      return { success: false, message: "Cannot connect to server. Is the backend running?" };
    }
  }

  async function signup(first_name, last_name, email, password) {
    try {
      const res  = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("ss_user",  JSON.stringify(data.user));
        localStorage.setItem("ss_token", data.token);
      }
      return data;
    } catch {
      return { success: false, message: "Cannot connect to server. Is the backend running?" };
    }
  }

  function logout() {
    setUser(null); setToken(null);
    localStorage.removeItem("ss_user");
    localStorage.removeItem("ss_token");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
