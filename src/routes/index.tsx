import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  ssr: false,
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/board" });
  }, [loading, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const action =
      mode === "in"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          });
    const { error } = await action;
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (mode === "up") setMessage("Conta criada. Confirme o e-mail para entrar.");
  };

  const resetPassword = async () => {
    if (!email) {
      setMessage("Informe o e-mail para receber o link de redefinição.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setMessage(error ? error.message : "Enviamos um link de redefinição para o seu e-mail.");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="app-panel w-full max-w-[380px] p-9"
      >
        <p className="text-[13px] font-bold tracking-[-0.04em]">LITERARE</p>
        <h1 className="mt-6 text-[24px] font-semibold leading-tight tracking-[-0.03em]">
          {mode === "in" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mt-1.5 text-[12px] text-muted-foreground">
          Operação de Marketing — acesso restrito à equipe.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-3">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
              E-mail
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field focus:field-focus mt-1"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
              Senha
            </span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field focus:field-focus mt-1"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {mode === "in" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        {message ? <p className="mt-3 text-[11px] text-foreground/70">{message}</p> : null}

        <div className="mt-5 flex items-center justify-between text-[11px] text-muted-foreground">
          <button onClick={resetPassword} className="hover:text-foreground">
            Esqueci minha senha
          </button>
          <button
            onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="hover:text-foreground"
          >
            {mode === "in" ? "Criar conta" : "Já tenho conta"}
          </button>
        </div>
      </motion.div>
    </main>
  );
}
