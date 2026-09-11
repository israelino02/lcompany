import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  AGENCIAS,
  AGENCIA_LABEL,
  type Cliente,
} from "@/lib/clientes";

interface Props {
  dia: string;
  clientes: Cliente[];
  checados: Set<string>;
  onAlternar: (cliente: Cliente) => void;
  onMarcarTodos: (agencia: string) => void;
}

export function ChecklistClientes({
  dia,
  clientes,
  checados,
  onAlternar,
  onMarcarTodos,
}: Props) {
  const ativos = clientes
    .filter((c) => c.ativo)
    .sort((a, b) => a.ordem - b.ordem);
  const feitos = ativos.filter((c) => checados.has(c.id)).length;
  const pct = ativos.length ? Math.round((feitos / ativos.length) * 100) : 0;
  const [, m, d] = dia.split("-");

  return (
    <section className="surface-card p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="label-caps">Contas conferidas · {d}/{m}</p>
        <span className="num text-xs font-semibold" style={{ color: "var(--gold)" }}>
          {feitos}/{ativos.length} · {pct}%
        </span>
      </div>

      <div className="mt-2 h-[5px] w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            transition: "width 150ms ease",
            background:
              pct === 100
                ? "linear-gradient(90deg,#2E9C74,#3FBF8F)"
                : "linear-gradient(90deg,#B8912A,#E8C766)",
          }}
        />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {AGENCIAS.map((ag) => {
          const lista = ativos.filter((c) => c.agencia === ag);
          if (lista.length === 0) return null;
          const okBloco = lista.filter((c) => checados.has(c.id)).length;
          return (
            <div key={ag}>
              <div className="flex items-center justify-between gap-2">
                <p className="label-caps" style={{ color: "var(--gold)" }}>
                  {AGENCIA_LABEL[ag]}
                </p>
                <div className="flex items-center gap-2">
                  <span className="num text-[11px] text-muted-foreground">
                    {okBloco}/{lista.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => onMarcarTodos(ag)}
                    className="rounded-[8px] border px-2 py-1 text-[10px] font-semibold"
                    style={{ borderColor: "var(--border-gold)", color: "var(--gold)" }}
                  >
                    Marcar tudo
                  </button>
                </div>
              </div>

              <ul className="mt-2 flex flex-col gap-1.5">
                {lista.map((c) => {
                  const ok = checados.has(c.id);
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => onAlternar(c)}
                        className="flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left transition-colors"
                        style={{
                          backgroundColor: "var(--surface-2)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <span
                          className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[6px]"
                          style={{
                            backgroundColor: ok ? "var(--concluido)" : "transparent",
                            border: ok
                              ? "1px solid var(--concluido)"
                              : "1px solid var(--border-gold)",
                          }}
                        >
                          {ok && <Check size={12} color="#07120C" strokeWidth={3} />}
                        </span>
                        <span
                          className="flex-1 text-[13px]"
                          style={{
                            opacity: ok ? 0.4 : 1,
                            textDecoration: ok ? "line-through" : "none",
                          }}
                        >
                          {c.nome}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <Link
        to="/clientes"
        className="mt-4 block rounded-[10px] border border-dashed py-2 text-center text-[11px] font-semibold"
        style={{ borderColor: "var(--border-gold)", color: "var(--gold)" }}
      >
        Ver carteira e valores
      </Link>
    </section>
  );
}
