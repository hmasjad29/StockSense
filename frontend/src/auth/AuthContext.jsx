import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API_BASE = "http://127.0.0.1:8000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("stocksense_user");
    const savedToken = localStorage.getItem("stocksense_token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data.success) {
      return { success: false, message: data.message };
    }

    localStorage.setItem("stocksense_user", JSON.stringify(data.user));
    localStorage.setItem("stocksense_token", data.token);

    setUser(data.user);
    setToken(data.token);

    return { success: true };
  };

  const signup = async (name, email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!data.success) {
      return { success: false, message: data.message };
    }

    localStorage.setItem("stocksense_user", JSON.stringify(data.user));
    localStorage.setItem("stocksense_token", data.token);

    setUser(data.user);
    setToken(data.token);

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem("stocksense_user");
    localStorage.removeItem("stocksense_token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}