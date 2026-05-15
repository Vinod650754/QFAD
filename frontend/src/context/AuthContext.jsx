import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

const getStoredToken = () => {
  try {
    return window.localStorage.getItem("qotd_token");
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/api/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        try {
          window.localStorage.removeItem("qotd_token");
        } catch {
          // no-op
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("qotd_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (payload) => {
    const { data } = await api.post("/api/auth/signup", payload);
    localStorage.setItem("qotd_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("qotd_token");
    setUser(null);
  };

  const value = useMemo(() => ({ user, setUser, loading, login, signup, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
