import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import {
  DIAS_LONGO,
  PRIORIDADES,
  PRIO_LABEL,
  PRIO_VAR,
  dataEscrita,
  isFimDeSemana,
  ordenarTarefas,
  parseYmd,
  ymd,
  type Prioridade,
  type Tarefa,
} from "@/lib/agenda";

interface Props {
  dia: string;
  tarefas: Tarefa[];
  onAdicionar: (texto: string, prioridade: Prioridade, hora: string | null) => void;
  onAlternar: (t: Tarefa) => void;
  onExcluir: (id: string) => void;
  onRepetir: () => void;
}

export function PainelDia({
  dia,
  tarefas,
  onAdicionar,
  onAlternar,
  onExcluir,
  onRepetir,
}: Props) {
  const [texto, setTexto] = useState("");
  const [prioridade, setPrioridade] = useState<Prioridade>("rotina");
  const [hora, setHora] = useState("");
  const d = parseYmd(dia);
  const lista = ordenarTarefas(tarefas);
  const ehHoje = dia === ymd(new Date());

  function atrasada(t: Tarefa): boolean {
    if (!ehHoje || t.feita || !t.hora) return false;
    const agora = new Date();
    const [h, m] = t.hora.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0) < agora.getHours() * 60 + agora.getMinutes();
  }

  function adicionar() {
    const t = texto.trim();
    if (!t) return;
    onAdicionar(t, prioridade, hora || null);
    setTexto("");
  }

  return (
    <section className="surface-card p-4 sm:p-5">
      <header className="flex items-baseline gap-3">
        <span className="font-display text-[32px] font-semibold leading-none" style={{ color: "var(--gold)" }}>
          {d.getDate()}
        </span>
        <div>
          <p className="label-caps">{DIAS_LONGO[d.getDay()]}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {dataEscrita(dia)}
            {isFimDeSemana(dia) ? " · fim de semana" : ""}
          </p>
        </div>
      </header>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
          placeholder="O que precisa ser feito nesse dia?"
          aria-label="Nova tarefa"
          className="min-w-0 flex-1 rounded-[10px] border border-border bg-surface-2 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="flex gap-2">
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            aria-label="Horário (opcional)"
            className="num rounded-[10px] border border-border bg-surface-2 px-2 py-2 text-sm outline-none"
            style={{ colorScheme: "dark" }}
          />
          <select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value as Prioridade)}
            aria-label="Prioridade"
            className="rounded-[10px] border border-border bg-surface-2 px-2 py-2 text-sm outline-none"
          >
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                {PRIO_LABEL[p]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={adicionar}
            className="gold-gradient rounded-[10px] px-4 py-2 text-sm font-semibold"
            style={{ color: "var(--background)" }}
          >
            Adicionar
          </button>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {lista.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-3 rounded-[10px] px-3 py-2.5"
            style={{
              backgroundColor: "var(--surface-2)",
              borderLeft: `3px solid ${PRIO_VAR[t.prioridade]}`,
            }}
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={t.feita}
              aria-label={t.feita ? "Marcar como pendente" : "Marcar como concluída"}
              onClick={() => onAlternar(t)}
              className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px]"
              style={{
                backgroundColor: t.feita ? "var(--feito)" : "transparent",
                border: t.feita ? "1px solid var(--feito)" : "1px solid rgb(255 255 255 / 22%)",
              }}
            >
              {t.feita && <Check size={12} strokeWidth={3} color="#07120d" />}
            </button>

            <span
              className="num shrink-0 text-xs"
              style={{
                minWidth: "40px",
                color: t.hora ? "var(--gold-light)" : "var(--muted-foreground)",
                opacity: t.feita ? 0.4 : t.hora ? 1 : 0.3,
                ...(atrasada(t) ? { color: "var(--urgente)", opacity: 1 } : {}),
              }}
            >
              {t.hora ? t.hora.slice(0, 5) : "--:--"}
            </span>

            <span
              className="min-w-0 flex-1 text-sm"
              style={{
                opacity: t.feita ? 0.4 : 1,
                textDecoration: t.feita ? "line-through" : "none",
              }}
            >
              {t.texto}
            </span>

            <span
              className="shrink-0 rounded-full px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[1.2px]"
              style={{
                color: PRIO_VAR[t.prioridade],
                backgroundColor: "color-mix(in oklab, " + PRIO_VAR[t.prioridade] + " 16%, transparent)",
              }}
            >
              {PRIO_LABEL[t.prioridade]}
            </span>

            <button
              type="button"
              onClick={() => onExcluir(t.id)}
              aria-label="Excluir tarefa"
              className="shrink-0 text-muted-foreground hover:text-[color:var(--urgente)]"
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>

      {lista.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Nenhuma tarefa nesse dia ainda. Escreva a primeira acima, defina o horário e escolha o nível.
        </p>
      )}

      {lista.length > 0 && (
        <button
          type="button"
          onClick={onRepetir}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] px-3 py-2.5 text-xs font-semibold"
          style={{
            border: "1px dashed var(--border-gold)",
            color: "var(--gold)",
          }}
        >
          <Plus size={13} />
          Repetir essas tarefas nos dias úteis restantes do mês
        </button>
      )}
    </section>
  );
}
