import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agenda Operacional — Seu mês inteiro em uma tela" },
      {
        name: "description",
        content:
          "Agenda operacional mensal para gestores de tráfego pago: tarefas por dia, prioridades e metas do mês em uma única tela.",
      },
      { property: "og:title", content: "Agenda Operacional" },
      {
        property: "og:description",
        content: "Seu mês inteiro em uma tela: tarefas por prioridade e metas do mês.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const DOMINIO_LOGIN = "agenda.local";

function normalizaLogin(v: string): string {
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
}

function traduzErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "Login ou senha incorretos";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Esse login já está em uso";
  if (m.includes("weak") || m.includes("easy to guess"))
    return "Essa senha é fraca demais. Escolha uma senha mais forte.";
  if (m.includes("password should be at least"))
    return "A senha precisa ter pelo menos 6 caracteres";
  if (m.includes("email rate limit") || m.includes("too many"))
    return "Muitas tentativas. Espere um instante e tente de novo.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "Use apenas letras, números, ponto, hífen ou underline no login";
  return "Não foi possível concluir. Tente novamente.";
}

function LoginPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;
    supabase.auth.getSession().then(({ data }) => {
      if (ativo && data.session) navigate({ to: "/agenda" });
    });
    return () => {
      ativo = false;
    };
  }, [navigate]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    const usuario = normalizaLogin(login);
    if (!usuario || !senha) {
      setErro("Preencha login e senha");
      return;
    }
    if (usuario.length < 3) {
      setErro("O login precisa ter pelo menos 3 caracteres");
      return;
    }
    const email = `${usuario}@${DOMINIO_LOGIN}`;
    setCarregando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });
        if (error) {
          setErro(traduzErro(error.message));
          return;
        }
        navigate({ to: "/agenda" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { login: usuario } },
        });
        if (error) {
          setErro(traduzErro(error.message));
          return;
        }
        if (data.session) {
          navigate({ to: "/agenda" });
          return;
        }
        const { error: erroEntrada } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });
        if (erroEntrada) {
          setErro(traduzErro(erroEntrada.message));
          return;
        }
        navigate({ to: "/agenda" });
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-14">
        <form onSubmit={enviar} className="w-full max-w-sm" noValidate>
          <p className="label-caps text-gold" style={{ color: "var(--gold)" }}>
            Agenda operacional
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold">
            {modo === "entrar" ? "Entrar na sua agenda" : "Criar sua conta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {modo === "entrar"
              ? "Acesse o mês inteiro em uma tela."
              : "Comece a organizar seu mês operacional."}
          </p>

          <label className="label-caps mt-8 block" htmlFor="login">
            Login
          </label>
          <input
            id="login"
            type="text"
            autoCapitalize="none"
            autoComplete="username"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="mt-2 w-full rounded-[10px] border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="seu.login"
          />

          <label className="label-caps mt-5 block" htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="mt-2 w-full rounded-[10px] border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="••••••••"
          />


          {erro && (
            <p
              role="alert"
              className="mt-4 rounded-[10px] px-3 py-2 text-sm"
              style={{
                color: "var(--urgente)",
                backgroundColor: "rgb(229 72 77 / 12%)",
                border: "1px solid rgb(229 72 77 / 30%)",
              }}
            >
              {erro}
            </p>
          )}
          {aviso && (
            <p
              className="mt-4 rounded-[10px] px-3 py-2 text-sm"
              style={{
                color: "var(--feito)",
                backgroundColor: "rgb(63 191 143 / 12%)",
                border: "1px solid rgb(63 191 143 / 30%)",
              }}
            >
              {aviso}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="gold-gradient mt-6 w-full rounded-[10px] px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
            style={{ color: "var(--background)" }}
          >
            {carregando
              ? modo === "entrar"
                ? "Entrando…"
                : "Criando conta…"
              : modo === "entrar"
                ? "Entrar"
                : "Criar conta"}
          </button>

          <p className="mt-5 text-xs text-muted-foreground">
            {modo === "entrar" ? "Ainda não tem conta? " : "Já tem conta? "}
            <button
              type="button"
              onClick={() => {
                setModo(modo === "entrar" ? "criar" : "entrar");
                setErro(null);
                setAviso(null);
              }}
              className="font-semibold underline underline-offset-4"
              style={{ color: "var(--gold)" }}
            >
              {modo === "entrar" ? "Criar conta" : "Entrar"}
            </button>
          </p>

          <p className="mt-3 text-xs text-muted-foreground">
            Guarde bem sua senha: como o acesso é só por login, não há recuperação por
            e-mail.
          </p>
        </form>
      </div>

      <aside
        className="relative hidden flex-col justify-end p-12 md:flex"
        style={{
          background:
            "radial-gradient(90% 70% at 70% 10%, #101b38 0%, #070c1a 65%), #070c1a",
          borderLeft: "1px solid var(--border-gold)",
        }}
      >
        <div
          className="absolute inset-x-12 top-12 h-px"
          style={{ backgroundColor: "var(--border-gold)" }}
        />
        <h2 className="font-display text-5xl font-semibold leading-tight">
          Agenda
          <br />
          Operacional
        </h2>
        <p className="mt-4 max-w-xs text-sm text-muted-foreground">
          Seu mês inteiro em uma tela.
        </p>
      </aside>
    </main>
  );
}
