import { useState, useCallback } from "react";
import type { User } from "@/types/auth";

const USERS_KEY = "kaos-users";
const SESSION_KEY = "kaos-session";

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch { return []; }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const login = useCallback((email: string, password: string): string | null => {
    const users = getUsers();
    const found = users.find((u) => u.email === email.toLowerCase().trim());
    if (!found) return "Usuário não encontrado";
    // In sim mode we store password hash as `email:password` key
    const storedPw = localStorage.getItem(`kaos-pw-${found.id}`);
    if (storedPw !== password) return "Senha incorreta";
    localStorage.setItem(SESSION_KEY, JSON.stringify(found));
    setUser(found);
    return null;
  }, []);

  const register = useCallback((email: string, password: string, displayName: string): string | null => {
    const trimEmail = email.toLowerCase().trim();
    if (!trimEmail || !password || password.length < 4) return "Preencha todos os campos (senha mínimo 4 caracteres)";
    const users = getUsers();
    if (users.find((u) => u.email === trimEmail)) return "Email já cadastrado";
    const newUser: User = { id: crypto.randomUUID(), email: trimEmail, displayName: displayName || trimEmail.split("@")[0] };
    saveUsers([...users, newUser]);
    localStorage.setItem(`kaos-pw-${newUser.id}`, password);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return null;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return { user, login, register, logout };
}
