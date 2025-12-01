import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load user saat refresh
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // LOGIN
  const login = (data) => {
    const payload = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      username: data.user.username,
      role: data.user.role,
      token: data.token,
      avatar: data.user.avatar ?? null, // <--- FIX PENTING
    };

    console.log("LOGIN PAYLOAD:", payload);

    localStorage.setItem("user", JSON.stringify(payload));
    setUser(payload);
  };

  // UPDATE USER PROFIL
  const updateUser = (updatedUser) => {
    const newUser = {
      ...user,
      ...updatedUser, // merge avatar & name baru
    };

    console.log("UPDATE USER:", newUser);

    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
