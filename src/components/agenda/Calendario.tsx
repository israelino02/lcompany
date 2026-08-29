import {
  DIAS_CURTO,
  PRIO_VAR,
  gradeDoMes,
  isFimDeSemana,
  type Tarefa,
} from "@/lib/agenda";

interface Props {
  ano: number;
  mes: number;
  hoje: string;
  tarefas: Tarefa[];
  selecionado: string;
  onSelecionar: (iso: string) => void;
}

export function Calendario({ ano, mes, hoje, tarefas, selecionado, onSelecionar }: Props) {
  const grade = gradeDoMes(ano, mes);
  const porDia = new Map<string, Tarefa[]>();
  for (const t of tarefas) {
    const lista = porDia.get(t.data) ?? [];
    lista.push(t);
    porDia.set(t.data, lista);
  }

  const uteis = grade.filter((d): d is string => !!d && !isFimDeSemana(d));
  const fechados = uteis.filter((d) => {
    const lista = porDia.get(d) ?? [];
    return lista.length > 0 && lista.every((t) => t.feita);
  }).length;

  return (
    <section className="surface-card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="label-caps">Calendário</p>
        <p className="num text-[11px] text-muted-foreground">
          <span style={{ color: "var(--gold)" }}>{fechados}</span> de {uteis.length} dias
          úteis fechados
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DIAS_CURTO.map((d, i) => (
          <div
            key={d}
            className="label-caps pb-1 text-center"
            style={{ opacity: i === 0 || i === 6 ? 0.45 : 1 }}
          >
            {d}
          </div>
        ))}

        {grade.map((iso, idx) => {
          if (!iso) return <div key={`v-${idx}`} />;
          const lista = porDia.get(iso) ?? [];
          const feitas = lista.filter((t) => t.feita).length;
          const pct = lista.length ? (feitas / lista.length) * 100 : 0;
          const fds = isFimDeSemana(iso);
          const ehHoje = iso === hoje;
          const sel = iso === selecionado;
          const tudoFeito = lista.length > 0 && feitas === lista.length;
          const numero = Number(iso.slice(8));

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelecionar(iso)}
              aria-label={`Dia ${numero}`}
              aria-current={sel ? "date" : undefined}
              className="relative flex min-h-[44px] flex-col rounded-[10px] p-1.5 text-left transition hover:-translate-y-px sm:min-h-[64px]"
              style={{
                backgroundColor: sel
                  ? "var(--surface-3)"
                  : ehHoje
                    ? "var(--surface-3)"
                    : fds
                      ? "rgb(255 255 255 / 2%)"
                      : "var(--surface-2)",
                border: sel
                  ? "1px solid var(--gold-light)"
                  : ehHoje
                    ? "1px solid var(--gold)"
                    : "1px solid var(--border)",
              }}
            >
              <span
                className="num text-[11px] font-semibold sm:text-xs"
                style={{
                  color: ehHoje
                    ? "var(--gold)"
                    : tudoFeito
                      ? "var(--feito)"
                      : fds
                        ? "var(--muted-foreground)"
                        : "var(--foreground)",
                  opacity: fds && !ehHoje && !tudoFeito ? 0.55 : 1,
                }}
              >
                {numero}
              </span>

              <span className="mt-1 flex flex-wrap gap-[3px]">
                {lista.slice(0, 6).map((t) => (
                  <span
                    key={t.id}
                    className="h-[5px] w-[5px] rounded-full"
                    style={{
                      backgroundColor: PRIO_VAR[t.prioridade],
                      opacity: t.feita ? 0.22 : 1,
                    }}
                  />
                ))}
              </span>

              {lista.length > 0 && (
                <span className="absolute inset-x-1.5 bottom-1 h-[2px] rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full transition-[width]"
                    style={{ width: `${pct}%`, backgroundColor: "var(--feito)" }}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {(["urgente", "importante", "rotina"] as const).map((p) => (
          <span key={p} className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span
              className="h-[6px] w-[6px] rounded-full"
              style={{ backgroundColor: PRIO_VAR[p] }}
            />
            {p === "urgente" ? "Urgente" : p === "importante" ? "Importante" : "Rotina"}
          </span>
        ))}
      </div>
    </section>
  );
}
