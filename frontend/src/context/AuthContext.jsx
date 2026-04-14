import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
      } catch {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const register = async (formData) => {
    const response = await api.post("/register", formData);
    const newToken = response.data.token;

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(response.data.user);

    return response.data;
  };

  const login = async (formData) => {
    const response = await api.post("/login", formData);
    const newToken = response.data.token;

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(response.data.user);

    return response.data;
  };

  const refreshUser = async () => {
    if (!token) return null;

    const response = await api.get("/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setUser(response.data);
    return response.data;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post(
          "/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!token,
        profileComplete: !!user?.profile_complete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}