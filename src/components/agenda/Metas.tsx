import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { progressoMeta, type Meta } from "@/lib/agenda";

interface Props {
  metas: Meta[];
  onAdicionar: (titulo: string, alvo: number) => void;
  onAjustar: (meta: Meta, delta: number) => void;
  onExcluir: (id: string) => void;
}

export function Metas({ metas, onAdicionar, onAjustar, onExcluir }: Props) {
  const [titulo, setTitulo] = useState("");
  const [alvo, setAlvo] = useState("");

  const media = metas.length
    ? metas.reduce((acc, m) => acc + progressoMeta(m), 0) / metas.length
    : 0;

  function adicionar() {
    const t = titulo.trim();
    const n = Math.max(1, Number(alvo) || 0);
    if (!t || !n) return;
    onAdicionar(t, n);
    setTitulo("");
    setAlvo("");
  }

  return (
    <section className="surface-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="label-caps">Metas do mês</p>
        <span className="num text-xs font-semibold" style={{ color: "var(--gold)" }}>
          {Math.round(media)}%
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {metas.map((m) => {
          const pct = progressoMeta(m);
          const batida = m.atual >= m.alvo;
          return (
            <div key={m.id}>
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 flex-1 truncate text-sm">{m.titulo}</p>
                <span className="num shrink-0 text-xs text-muted-foreground">
                  <span
                    className="text-base font-semibold"
                    style={{ color: batida ? "var(--feito)" : "var(--gold)" }}
                  >
                    {m.atual}
                  </span>
                  /{m.alvo}
                </span>
                <button
                  type="button"
                  onClick={() => onExcluir(m.id)}
                  aria-label="Excluir meta"
                  className="shrink-0 text-muted-foreground hover:text-[color:var(--urgente)]"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="mt-2 h-[5px] w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={batida ? "green-gradient h-full" : "gold-gradient h-full"}
                  style={{ width: `${pct}%`, transition: "width 150ms ease" }}
                />
              </div>

              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAjustar(m, -1)}
                  aria-label={`Diminuir ${m.titulo}`}
                  className="flex h-6 w-6 items-center justify-center rounded-[8px] border border-border bg-surface-2 text-muted-foreground"
                >
                  <Minus size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => onAjustar(m, 1)}
                  aria-label={`Aumentar ${m.titulo}`}
                  className="flex h-6 w-6 items-center justify-center rounded-[8px] border border-border bg-surface-2"
                  style={{ color: "var(--gold)" }}
                >
                  <Plus size={12} />
                </button>
                {batida && (
                  <span
                    className="rounded-full px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[1.2px]"
                    style={{
                      color: "var(--feito)",
                      backgroundColor: "color-mix(in oklab, var(--feito) 16%, transparent)",
                    }}
                  >
                    Batida
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {metas.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Sem metas definidas. Escreva o que você quer bater nesse mês e o número que fecha
          a conta.
        </p>
      )}

      <div className="mt-5 flex gap-2 border-t border-border pt-4">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Nova meta"
          aria-label="Nova meta"
          className="min-w-0 flex-1 rounded-[10px] border border-border bg-surface-2 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <input
          value={alvo}
          onChange={(e) => setAlvo(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && adicionar()}
          inputMode="numeric"
          placeholder="10"
          aria-label="Alvo"
          className="num w-16 rounded-[10px] border border-border bg-surface-2 px-2 py-2 text-center text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={adicionar}
          aria-label="Criar meta"
          className="gold-gradient flex h-[38px] w-10 items-center justify-center rounded-[10px]"
          style={{ color: "var(--background)" }}
        >
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>
    </section>
  );
}
