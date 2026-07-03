import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Props {
  onLogin: (email: string, password: string) => string | null;
  onRegister: (email: string, password: string, displayName: string) => string | null;
  onCancel?: () => void;
}

export function AuthScreen({ onLogin, onRegister, onCancel }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      const err = onLogin(email, password);
      if (err) setError(err);
    } else {
      const err = onRegister(email, password, displayName);
      if (err) setError(err);
    }
  };

  return (
    <div className="min-h-screen bg-background scanline flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-primary text-glow">KAOS</h1>
          <p className="text-muted-foreground text-xs font-mono mt-1">EM NOVA PATOS — 2224</p>
        </div>

        <form onSubmit={handleSubmit} className="border border-border rounded p-4 bg-card space-y-4">
          <h2 className="font-display text-sm font-bold text-foreground uppercase tracking-widest">
            {mode === "login" ? "> ACESSAR TERMINAL" : "> REGISTRAR ACESSO"}
          </h2>

          {mode === "register" && (
            <div className="space-y-1">
              <Label className="text-foreground text-xs uppercase tracking-widest">Nome</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome de operador"
                className="bg-background border-border font-mono text-foreground"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-foreground text-xs uppercase tracking-widest">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operador@novapatos.net"
              className="bg-background border-border font-mono text-foreground"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-foreground text-xs uppercase tracking-widest">Senha</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="bg-background border-border font-mono text-foreground"
              required
            />
          </div>

          {error && (
            <p className="text-destructive text-xs font-mono">{error}</p>
          )}

          <Button type="submit" className="w-full font-mono text-xs">
            {mode === "login" ? "ENTRAR" : "CRIAR CONTA"}
          </Button>

          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="w-full text-center text-xs text-muted-foreground hover:text-primary font-mono"
          >
            {mode === "login" ? "Não tem acesso? Registre-se" : "Já tem acesso? Faça login"}
          </button>
        </form>

        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full text-center text-xs text-muted-foreground hover:text-primary font-mono"
          >
            ← Continuar como convidado
          </button>
        )}

        <p className="text-center text-[10px] text-muted-foreground font-mono">
          ⚠ SIMULAÇÃO LOCAL — dados salvos no navegador
        </p>
      </div>
    </div>
  );
}
