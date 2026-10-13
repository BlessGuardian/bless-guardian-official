import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { login, register } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (mode === "login") {
      const res = await login(email.trim(), password);
      setLoading(false);
      if (res.user) navigate("/dashboard");
      else setError(res.error ?? "E-mail ou senha incorretos");
    } else {
      const res = await register(email.trim(), password, deviceId.trim() || undefined);
      setLoading(false);
      if (res.error) setError(res.error);
      else {
        setSuccess("Conta criada! Agora é só entrar.");
        setMode("login");
      }
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <a href="/" className="inline-flex items-center gap-2 mb-4">
            <img src={logo} alt="BlessGuardian" className="h-12 w-12" />
          </a>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isLogin ? "Entrar no BlessGuardian" : "Criar conta"}
          </h1>
          <p className="text-sm text-muted-foreground">Acesse seu painel de proteção contra fraudes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 p-3 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={isLogin ? 1 : 6} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="device">ID do dispositivo</Label>
              <Input id="device" placeholder="Mostrado no app BlessGuardian" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} required />
              <p className="text-xs text-muted-foreground">Conecta sua conta às análises feitas no seu celular.</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Aguarde...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {isLogin ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {isLogin ? "Entrar" : "Criar conta"}
              </span>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Ainda não tem conta? " : "Já tem conta? "}
            <button type="button" className="text-primary hover:underline" onClick={() => { setMode(isLogin ? "register" : "login"); setError(""); setSuccess(""); }}>
              {isLogin ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          <a href="/" className="hover:text-foreground transition-colors">← Voltar ao site</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
