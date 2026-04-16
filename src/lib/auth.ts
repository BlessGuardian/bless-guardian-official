// ====================================================
// Mock Authentication Service
// Replace this file with real auth (e.g. Supabase Auth)
// when your backend is ready.
// ====================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

const MOCK_USERS = [
  { id: "1", name: "João Silva", email: "joao@email.com", password: "123456" },
  { id: "2", name: "Maria Santos", email: "maria@email.com", password: "123456" },
];

const AUTH_KEY = "blessguardian_user";

export function login(email: string, password: string): User | null {
  const found = MOCK_USERS.find(
    (u) => u.email === email && u.password === password
  );
  if (!found) return null;
  const { password: _, ...user } = found;
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
