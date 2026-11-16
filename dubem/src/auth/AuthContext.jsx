import { createContext, useContext, useEffect, useState } from "react";
import { getToken, logout as apiLogout, me, setToken as persistToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let active = true;
    me()
      .then((data) => {
        if (active) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          persistToken(null);
          setTokenState(null);
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const signIn = (nextUser, nextToken) => {
    if (nextToken) {
      persistToken(nextToken);
      setTokenState(nextToken);
    }
    setUser(nextUser);
  };

  const signOut = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore server-side logout failure; clear client session anyway
    }
    persistToken(null);
    setTokenState(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    role: user?.role ?? "guest",
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}