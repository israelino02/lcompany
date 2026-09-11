import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AGENCIAS,
  AGENCIA_LABEL,
  BLOCO_FIXO,
  brl,
  receitaBloco,
  receitaTotal,
  type Agencia,
  type Cliente,
} from "@/lib/clientes";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Carteira de clientes — Agenda Operacional" },
      {
        name: "description",
        content:
          "Sua carteira de clientes por agência, com valor mensal, dia de pagamento e contas encerradas.",
      },
      { property: "og:title", content: "Carteira de clientes — Agenda Operacional" },
      {
        property: "og:description",
        content: "Clientes ativos por bloco, receita mensal e histórico de contas encerradas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientesPage,
});

function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [agencia, setAgencia] = useState<Agencia>("diretos");
  const [mensal, setMensal] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const carregar = useCallback(async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("ordem", { ascending: true });
    if (error) {
      toast.error("Não foi possível carregar seus clientes.");
      return;
    }
    setClientes((data ?? []) as Cliente[]);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const ativos = clientes.filter((c) => c.ativo);
  const encerrados = clientes.filter((c) => !c.ativo);
  const total = useMemo(() => receitaTotal(clientes), [clientes]);

  async function adicionar() {
    const t = nome.trim();
    if (!t || !userId) return;
    const ordem = Math.max(0, ...clientes.map((c) => c.ordem)) + 1;
    const valor = mensal.trim() ? Number(mensal.replace(",", ".")) : null;
    const { data, error } = await supabase
      .from("clientes")
      .insert({ user_id: userId, nome: t, agencia, mensal: valor, ordem })
      .select()
      .single();
    if (error || !data) {
      toast.error("Não foi possível salvar. Verifique sua conexão.");
      return;
    }
    setClientes((prev) => [...prev, data as Cliente]);
    setNome("");
    setMensal("");
  }

  async function alternarAtivo(c: Cliente) {
    setClientes((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, ativo: !c.ativo } : x)),
    );
    const { error } = await supabase
      .from("clientes")
      .update({ ativo: !c.ativo })
      .eq("id", c.id);
    if (error) {
      setClientes((prev) => prev.map((x) => (x.id === c.id ? { ...x, ativo: c.ativo } : x)));
      toast.error("Não foi possível salvar. Verifique sua conexão.");
    }
  }

  async function excluir(id: string) {
    const anterior = clientes;
    setClientes((prev) => prev.filter((c) => c.id !== id));
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) {
      setClientes(anterior);
      toast.error("Não foi possível salvar. Verifique sua conexão.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps" style={{ color: "var(--gold)" }}>
            Carteira
          </p>
          <h1 className="mt-1 font-display text-[28px] font-semibold leading-none sm:text-[38px]">
            Clientes{" "}
            <span className="num text-base text-muted-foreground">
              {ativos.length} contas · {brl(total)}/mês
            </span>
          </h1>
        </div>
        <Link
          to="/agenda"
          className="flex items-center gap-1.5 rounded-[10px] border border-border bg-surface-2 px-3 py-2 text-xs text-muted-foreground"
        >
          <ArrowLeft size={13} />
          Voltar à agenda
        </Link>
      </header>

      <div className="mt-6 flex flex-col gap-5">
        {AGENCIAS.map((ag) => {
          const lista = ativos.filter((c) => c.agencia === ag);
          if (lista.length === 0) return null;
          const fixo = BLOCO_FIXO[ag];
          return (
            <section key={ag} className="surface-card p-4 sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="label-caps" style={{ color: "var(--gold)" }}>
                  {AGENCIA_LABEL[ag]}
                </p>
                <span className="num text-sm font-semibold" style={{ color: "var(--gold)" }}>
                  {brl(receitaBloco(ag, clientes))}
                </span>
              </div>
              {fixo != null && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Valor fixo do bloco, não é por conta. Dá {brl(fixo / lista.length)} por conta
                  se dividir — se entrar uma conta nova, o valor não sobe sozinho.
                </p>
              )}
              <ul className="mt-3 flex flex-col gap-1.5">
                {lista.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 rounded-[10px] px-3 py-2"
                    style={{
                      backgroundColor: "var(--surface-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px]">{c.nome}</p>
                      {(c.servico || c.dia_pagamento) && (
                        <p className="truncate text-[11px] text-muted-foreground">
                          {[c.servico, c.dia_pagamento].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <span className="num text-xs" style={{ color: "var(--gold-light)" }}>
                      {c.mensal != null ? brl(Number(c.mensal)) : "—"}
                    </span>
                    <button
                      type="button"
                      onClick={() => alternarAtivo(c)}
                      className="rounded-[8px] border border-border px-2 py-1 text-[10px] text-muted-foreground"
                    >
                      Encerrar
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section className="surface-card p-4 sm:p-5">
          <p className="label-caps">Encerrados</p>
          {encerrados.length === 0 ? (
            <p className="mt-3 text-[13px] text-muted-foreground">
              Nenhuma conta encerrada por aqui.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1.5">
              {encerrados.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-[10px] px-3 py-2"
                  style={{
                    backgroundColor: "var(--surface-2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] opacity-60">{c.nome}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {[c.servico, c.observacao].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="num text-xs text-muted-foreground">
                    {c.mensal != null ? brl(Number(c.mensal)) : "—"}
                  </span>
                  <button
                    type="button"
                    onClick={() => alternarAtivo(c)}
                    className="rounded-[8px] border px-2 py-1 text-[10px]"
                    style={{ borderColor: "var(--border-gold)", color: "var(--gold)" }}
                  >
                    Reativar
                  </button>
                  <button
                    type="button"
                    onClick={() => excluir(c.id)}
                    aria-label={`Excluir ${c.nome}`}
                    className="text-muted-foreground"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-card p-4 sm:p-5">
          <p className="label-caps">Nova conta</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionar()}
              placeholder="Nome do cliente"
              className="min-w-[160px] flex-1 rounded-[10px] border border-border bg-surface-2 px-3 py-2 text-[13px] outline-none"
            />
            <select
              value={agencia}
              onChange={(e) => setAgencia(e.target.value as Agencia)}
              className="rounded-[10px] border border-border bg-surface-2 px-2 py-2 text-[12px]"
            >
              {AGENCIAS.map((a) => (
                <option key={a} value={a}>
                  {AGENCIA_LABEL[a]}
                </option>
              ))}
            </select>
            <input
              value={mensal}
              onChange={(e) => setMensal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionar()}
              placeholder="Mensal"
              inputMode="decimal"
              className="num w-[92px] rounded-[10px] border border-border bg-surface-2 px-3 py-2 text-[13px] outline-none"
            />
            <button
              type="button"
              onClick={adicionar}
              className="gold-gradient flex h-[38px] w-[38px] items-center justify-center rounded-[10px]"
              aria-label="Adicionar cliente"
            >
              <Plus size={16} color="#0B1020" strokeWidth={3} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
