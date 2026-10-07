import { createContext, useContext, useState } from "react";

const USERS = {
  guest:  null,
  seeker: { name: "Ada Okafor",  email: "ada@example.com",     role: "seeker" },
  org:    { name: "Kora Health", email: "careers@kora.example", role: "org" },
  admin:  { name: "Dubem admin", email: "admin@dubem.com",      role: "admin" },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState("guest");      // change "guest" to test other views
  const user = USERS[role];

  const value = {
    user,                                          // null when signed out
    role,                                          // "guest" | "seeker" | "org" | "admin"
    signInAs: (r) => setRole(r),
    signOut: () => setRole("guest"),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}