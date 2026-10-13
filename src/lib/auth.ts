import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email: string;
  role: string;
  token: string;
}

const AUTH_KEY = "blessguardian_user";

type AuthResult = { user?: User; error?: string; message?: string };

async function callAuth(action: "login" | "register", payload: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke("bless-auth", { body: { action, ...payload } });
  if (error) return { error: "Não foi possível conectar ao servidor" };
  return data ?? {};
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const data = await callAuth("login", { email, password });
  if (data.error || !data.user_id) return { error: data.error ?? "E-mail ou senha incorretos" };
  const user: User = { id: data.user_id, email, role: data.role ?? "default", token: data.access_token };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return { user };
}

export async function register(email: string, password: string, deviceId?: string): Promise<AuthResult> {
  const payload: Record<string, string> = { email, password };
  if (deviceId) payload.device_id = deviceId;
  const data = await callAuth("register", payload);
  if (data.error) return { error: data.error };
  return { message: data.message ?? "Conta criada com sucesso" };
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
