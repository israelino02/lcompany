import { PRIO_LABEL, PRIO_VAR, type Prioridade, type Tarefa } from "@/lib/agenda";

const NIVEIS: Prioridade[] = ["urgente", "importante", "rotina"];

export function Pendencias({ tarefas }: { tarefas: Tarefa[] }) {
  return (
    <section className="surface-card p-4 sm:p-5">
      <p className="label-caps">Pendências por nível</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {NIVEIS.map((p) => {
          const n = tarefas.filter((t) => !t.feita && t.prioridade === p).length;
          return (
            <div
              key={p}
              className="rounded-[10px] px-2 py-3 text-center"
              style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <p
                className="num text-2xl font-semibold leading-none"
                style={{ color: PRIO_VAR[p] }}
              >
                {n}
              </p>
              <p className="label-caps mt-2">{PRIO_LABEL[p]}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
