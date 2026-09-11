import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [nome, setNome] = useState("");
  const [agencia, setAgencia] = useState<Agencia>("diretos");
  const [mensal, setMensal] = useState("");
  const [servico, setServico] = useState("");
  const [diaPagamento, setDiaPagamento] = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

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

  function abrirNovo() {
    setEditando(null);
    setNome("");
    setAgencia("diretos");
    setMensal("");
    setServico("");
    setDiaPagamento("");
    setObservacao("");
    setDialogAberto(true);
  }

  function abrirEdicao(cliente: Cliente) {
    setEditando(cliente);
    setNome(cliente.nome);
    setAgencia(cliente.agencia as Agencia);
    setMensal(cliente.mensal == null ? "" : String(cliente.mensal));
    setServico(cliente.servico ?? "");
    setDiaPagamento(cliente.dia_pagamento ?? "");
    setObservacao(cliente.observacao ?? "");
    setDialogAberto(true);
  }

  async function salvarCliente() {
    const t = nome.trim();
    if (!t || !userId) return;
    const valor = mensal.trim() ? Number(mensal.replace(",", ".")) : null;
    if (valor != null && (!Number.isFinite(valor) || valor < 0)) {
      toast.error("Informe um valor mensal válido.");
      return;
    }
    setSalvando(true);
    const campos = {
      nome: t,
      agencia,
      mensal: valor,
      servico: servico.trim() || null,
      dia_pagamento: diaPagamento.trim() || null,
      observacao: observacao.trim() || null,
    };
    const consulta = editando
      ? supabase.from("clientes").update(campos).eq("id", editando.id)
      : supabase.from("clientes").insert({
          ...campos,
          user_id: userId,
          ordem: Math.max(0, ...clientes.map((c) => c.ordem)) + 1,
        });
    const { data, error } = await consulta.select().single();
    setSalvando(false);
    if (error || !data) {
      toast.error("Não foi possível salvar. Verifique sua conexão.");
      return;
    }
    setClientes((prev) =>
      editando
        ? prev.map((cliente) => (cliente.id === editando.id ? (data as Cliente) : cliente))
        : [...prev, data as Cliente],
    );
    setDialogAberto(false);
    toast.success(editando ? "Cliente atualizado." : "Cliente adicionado.");
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
        <div className="flex items-center gap-2">
          <Button onClick={abrirNovo} className="gold-gradient text-primary-foreground">
            <Plus /> Novo cliente
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/agenda">
              <ArrowLeft /> Voltar à agenda
            </Link>
          </Button>
        </div>
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => abrirEdicao(c)}
                      aria-label={`Editar ${c.nome}`}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      onClick={() => alternarAtivo(c)}
                      variant="outline"
                      size="sm"
                    >
                      Encerrar
                    </Button>
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => abrirEdicao(c)}
                    aria-label={`Editar ${c.nome}`}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    onClick={() => alternarAtivo(c)}
                    variant="outline"
                    size="sm"
                  >
                    Reativar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => excluir(c.id)}
                    aria-label={`Excluir ${c.nome}`}
                    variant="ghost"
                    size="icon"
                  >
                    <X size={14} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-background sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar cliente" : "Novo cliente"}</DialogTitle>
            <DialogDescription>
              Registre a agência, o trabalho realizado e os dados de pagamento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs text-muted-foreground sm:col-span-2">
              Nome do cliente
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="rounded-[8px] border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                autoFocus
              />
            </label>
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              Agência
              <select
                value={agencia}
                onChange={(e) => setAgencia(e.target.value as Agencia)}
                className="rounded-[8px] border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground"
              >
                {AGENCIAS.map((a) => (
                  <option key={a} value={a}>{AGENCIA_LABEL[a]}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              Valor mensal
              <input
                value={mensal}
                onChange={(e) => setMensal(e.target.value)}
                placeholder="Ex.: 1200"
                inputMode="decimal"
                className="num rounded-[8px] border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-muted-foreground sm:col-span-2">
              O que é feito para este cliente
              <textarea
                value={servico}
                onChange={(e) => setServico(e.target.value)}
                placeholder="Ex.: Meta Ads, Google Ads, site e relatórios"
                rows={3}
                className="resize-none rounded-[8px] border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              Dia do pagamento
              <input
                value={diaPagamento}
                onChange={(e) => setDiaPagamento(e.target.value)}
                placeholder="Ex.: Dia 10"
                className="rounded-[8px] border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              Observação
              <input
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Informação opcional"
                className="rounded-[8px] border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)}>Cancelar</Button>
            <Button
              onClick={salvarCliente}
              disabled={salvando || !nome.trim()}
              className="gold-gradient text-primary-foreground"
            >
              {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Adicionar cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
