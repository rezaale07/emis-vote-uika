import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Load user saat refresh
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoadingAuth(false);
  }, []);

  const login = (data) => {
    const payload = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      username: data.user.username,
      role: data.user.role,
      avatar: data.user.avatar ?? null,
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user_id", String(data.user.id));
    localStorage.setItem("user", JSON.stringify(payload));

    setUser(payload);
  };

  const updateUser = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
