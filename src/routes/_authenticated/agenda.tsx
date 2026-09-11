import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Calendario } from "@/components/agenda/Calendario";
import { PainelDia } from "@/components/agenda/PainelDia";
import { Metas } from "@/components/agenda/Metas";
import { Pendencias } from "@/components/agenda/Pendencias";
import { ChecklistClientes } from "@/components/agenda/ChecklistClientes";
import type { Checagem, Cliente } from "@/lib/clientes";
import {
  MESES,
  conclusaoDoMes,
  diasDoMes,
  isFimDeSemana,
  mesKey,
  ymd,
  type Meta,
  type Prioridade,
  type Tarefa,
} from "@/lib/agenda";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda do mês — Agenda Operacional" },
      {
        name: "description",
        content:
          "Veja o mês inteiro em uma tela: tarefas por dia, prioridades, metas e pendências.",
      },
      { property: "og:title", content: "Agenda do mês — Agenda Operacional" },
      {
        property: "og:description",
        content: "Tarefas por dia, prioridades e metas do mês em uma única tela.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AgendaPage,
});

const erroSalvar = () =>
  toast.error("Não foi possível salvar. Verifique sua conexão.");

function AgendaPage() {
  const navigate = useNavigate();
  const hoje = useMemo(() => ymd(new Date()), []);
  const [ano, setAno] = useState(() => new Date().getFullYear());
  const [mes, setMes] = useState(() => new Date().getMonth());
  const [selecionado, setSelecionado] = useState(hoje);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [checagens, setChecagens] = useState<Checagem[]>([]);

  const chaveMes = mesKey(ano, mes);
  const dias = useMemo(() => diasDoMes(ano, mes), [ano, mes]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const carregar = useCallback(async () => {
    const primeiro = dias[0]!;
    const ultimo = dias[dias.length - 1]!;
    const [rt, rm] = await Promise.all([
      supabase
        .from("tarefas")
        .select("*")
        .gte("data", primeiro)
        .lte("data", ultimo)
        .order("created_at", { ascending: true }),
      supabase
        .from("metas")
        .select("*")
        .eq("mes", chaveMes)
        .order("created_at", { ascending: true }),
    ]);
    if (rt.error || rm.error) {
      toast.error("Não foi possível carregar os dados do mês.");
      return;
    }
    setTarefas((rt.data ?? []) as Tarefa[]);
    setMetas((rm.data ?? []) as Meta[]);
  }, [chaveMes, dias]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  function trocarMes(delta: number) {
    const d = new Date(ano, mes + delta, 1);
    setAno(d.getFullYear());
    setMes(d.getMonth());
    setSelecionado(ymd(d));
  }

  function irParaHoje() {
    const d = new Date();
    setAno(d.getFullYear());
    setMes(d.getMonth());
    setSelecionado(ymd(d));
  }

  const tarefasDoDia = tarefas.filter((t) => t.data === selecionado);
  const conclusao = conclusaoDoMes(tarefas, metas);

  async function adicionarTarefa(texto: string, prioridade: Prioridade, hora: string | null) {
    if (!userId) return;
    const { data, error } = await supabase
      .from("tarefas")
      .insert({ user_id: userId, data: selecionado, texto, prioridade, hora })
      .select()
      .single();
    if (error || !data) {
      erroSalvar();
      return;
    }
    setTarefas((prev) => [...prev, data as Tarefa]);
  }

  async function alternarTarefa(t: Tarefa) {
    setTarefas((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, feita: !t.feita } : x)),
    );
    const { error } = await supabase
      .from("tarefas")
      .update({ feita: !t.feita })
      .eq("id", t.id);
    if (error) {
      setTarefas((prev) => prev.map((x) => (x.id === t.id ? { ...x, feita: t.feita } : x)));
      erroSalvar();
    }
  }

  async function excluirTarefa(id: string) {
    const anterior = tarefas;
    setTarefas((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from("tarefas").delete().eq("id", id);
    if (error) {
      setTarefas(anterior);
      erroSalvar();
    }
  }

  async function repetirNosDiasUteis() {
    if (!userId) return;
    const base = tarefasDoDia;
    if (base.length === 0) return;
    const restantes = dias.filter(
      (d) => d > selecionado && !isFimDeSemana(d),
    );
    const novas: {
      user_id: string;
      data: string;
      texto: string;
      prioridade: Prioridade;
      hora: string | null;
    }[] = [];
    for (const dia of restantes) {
      const existentes = new Set(
        tarefas.filter((t) => t.data === dia).map((t) => t.texto.trim().toLowerCase()),
      );
      for (const t of base) {
        const chave = t.texto.trim().toLowerCase();
        if (existentes.has(chave)) continue;
        existentes.add(chave);
        novas.push({
          user_id: userId,
          data: dia,
          texto: t.texto,
          prioridade: t.prioridade,
          hora: t.hora,
        });
      }
    }
    if (novas.length === 0) {
      toast("Nada novo para repetir nos dias úteis restantes.");
      return;
    }
    const { data, error } = await supabase.from("tarefas").insert(novas).select();
    if (error || !data) {
      erroSalvar();
      return;
    }
    setTarefas((prev) => [...prev, ...(data as Tarefa[])]);
    toast.success(`${data.length} tarefa(s) repetida(s).`);
  }

  async function adicionarMeta(titulo: string, alvo: number) {
    if (!userId) return;
    const { data, error } = await supabase
      .from("metas")
      .insert({ user_id: userId, mes: chaveMes, titulo, alvo })
      .select()
      .single();
    if (error || !data) {
      erroSalvar();
      return;
    }
    setMetas((prev) => [...prev, data as Meta]);
  }

  async function ajustarMeta(meta: Meta, delta: number) {
    const novo = Math.max(0, meta.atual + delta);
    if (novo === meta.atual) return;
    setMetas((prev) => prev.map((m) => (m.id === meta.id ? { ...m, atual: novo } : m)));
    const { error } = await supabase.from("metas").update({ atual: novo }).eq("id", meta.id);
    if (error) {
      setMetas((prev) =>
        prev.map((m) => (m.id === meta.id ? { ...m, atual: meta.atual } : m)),
      );
      erroSalvar();
    }
  }

  async function excluirMeta(id: string) {
    const anterior = metas;
    setMetas((prev) => prev.filter((m) => m.id !== id));
    const { error } = await supabase.from("metas").delete().eq("id", id);
    if (error) {
      setMetas(anterior);
      erroSalvar();
    }
  }

  async function alternarChecagem(c: Cliente) {
    if (!userId) return;
    const existente = checagens.find(
      (x) => x.cliente_id === c.id && x.data === selecionado,
    );
    if (existente) {
      setChecagens((prev) => prev.filter((x) => x.id !== existente.id));
      const { error } = await supabase.from("checagens").delete().eq("id", existente.id);
      if (error) {
        setChecagens((prev) => [...prev, existente]);
        erroSalvar();
      }
      return;
    }
    const { data, error } = await supabase
      .from("checagens")
      .insert({ user_id: userId, cliente_id: c.id, data: selecionado })
      .select()
      .single();
    if (error || !data) {
      erroSalvar();
      return;
    }
    setChecagens((prev) => [...prev, data as Checagem]);
  }

  async function marcarTodosDoBloco(agencia: string) {
    if (!userId) return;
    const feitos = new Set(
      checagens.filter((x) => x.data === selecionado).map((x) => x.cliente_id),
    );
    const faltando = clientes.filter(
      (c) => c.ativo && c.agencia === agencia && !feitos.has(c.id),
    );
    if (faltando.length === 0) return;
    const { data, error } = await supabase
      .from("checagens")
      .insert(
        faltando.map((c) => ({ user_id: userId, cliente_id: c.id, data: selecionado })),
      )
      .select();
    if (error || !data) {
      erroSalvar();
      return;
    }
    setChecagens((prev) => [...prev, ...(data as Checagem[])]);
  }

  async function sair() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps" style={{ color: "var(--gold)" }}>
            Agenda operacional
          </p>
          <h1 className="mt-1 font-display text-[28px] font-semibold leading-none sm:text-[38px]">
            {MESES[mes]}{" "}
            <span className="text-muted-foreground">{ano}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => trocarMes(-1)}
            aria-label="Mês anterior"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-surface-2 text-muted-foreground"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={irParaHoje}
            className="rounded-[10px] border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: "var(--border-gold)", color: "var(--gold)" }}
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => trocarMes(1)}
            aria-label="Mês seguinte"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-surface-2 text-muted-foreground"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={sair}
            className="ml-1 flex items-center gap-1.5 rounded-[10px] border border-border bg-surface-2 px-3 py-2 text-xs text-muted-foreground"
          >
            <LogOut size={13} />
            Sair
          </button>
        </div>
      </header>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="label-caps">Conclusão do mês</p>
          <span className="num text-xs font-semibold" style={{ color: "var(--gold)" }}>
            {Math.round(conclusao)}%
          </span>
        </div>
        <div className="mt-2 h-[6px] w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="gold-gradient h-full rounded-full"
            style={{ width: `${conclusao}%`, transition: "width 300ms ease" }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-5 min-[880px]:grid-cols-[1.45fr_1fr]">
        <div className="flex flex-col gap-5">
          <Calendario
            ano={ano}
            mes={mes}
            hoje={hoje}
            tarefas={tarefas}
            selecionado={selecionado}
            onSelecionar={setSelecionado}
          />
          <PainelDia
            dia={selecionado}
            tarefas={tarefasDoDia}
            onAdicionar={adicionarTarefa}
            onAlternar={alternarTarefa}
            onExcluir={excluirTarefa}
            onRepetir={repetirNosDiasUteis}
          />
        </div>
        <div className="flex flex-col gap-5">
          <Metas
            metas={metas}
            onAdicionar={adicionarMeta}
            onAjustar={ajustarMeta}
            onExcluir={excluirMeta}
          />
          <Pendencias tarefas={tarefas} />
          <ChecklistClientes
            dia={selecionado}
            clientes={clientes}
            checados={
              new Set(
                checagens.filter((c) => c.data === selecionado).map((c) => c.cliente_id),
              )
            }
            onAlternar={alternarChecagem}
            onMarcarTodos={marcarTodosDoBloco}
          />
        </div>
      </div>
    </main>
  );
}
