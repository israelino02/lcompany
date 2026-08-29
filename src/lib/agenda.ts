export type Prioridade = "urgente" | "importante" | "rotina";

export interface Tarefa {
  id: string;
  user_id: string;
  data: string;
  texto: string;
  prioridade: Prioridade;
  feita: boolean;
  created_at: string;
}

export interface Meta {
  id: string;
  user_id: string;
  mes: string;
  titulo: string;
  alvo: number;
  atual: number;
  created_at: string;
}

export const PRIORIDADES: Prioridade[] = ["rotina", "importante", "urgente"];

export const PRIO_LABEL: Record<Prioridade, string> = {
  urgente: "Urgente",
  importante: "Importante",
  rotina: "Rotina",
};

export const PRIO_VAR: Record<Prioridade, string> = {
  urgente: "var(--urgente)",
  importante: "var(--importante)",
  rotina: "var(--rotina)",
};

export const PRIO_ORDEM: Record<Prioridade, number> = {
  urgente: 0,
  importante: 1,
  rotina: 2,
};

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const MESES_MIN = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export const DIAS_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const DIAS_LONGO = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function parseYmd(s: string): Date {
  const parts = s.split("-").map(Number);
  return new Date(parts[0] ?? 1970, (parts[1] ?? 1) - 1, parts[2] ?? 1);
}

export function mesKey(ano: number, mes: number): string {
  return `${ano}-${String(mes + 1).padStart(2, "0")}`;
}

export function diasDoMes(ano: number, mes: number): string[] {
  const total = new Date(ano, mes + 1, 0).getDate();
  const out: string[] = [];
  for (let i = 1; i <= total; i += 1) out.push(ymd(new Date(ano, mes, i)));
  return out;
}

/** Grade do calendário: células vazias antes do dia 1. */
export function gradeDoMes(ano: number, mes: number): (string | null)[] {
  const inicio = new Date(ano, mes, 1).getDay();
  const cells: (string | null)[] = Array.from({ length: inicio }, () => null);
  return cells.concat(diasDoMes(ano, mes));
}

export function isFimDeSemana(iso: string): boolean {
  const dia = parseYmd(iso).getDay();
  return dia === 0 || dia === 6;
}

export function dataEscrita(iso: string): string {
  const d = parseYmd(iso);
  return `${d.getDate()} de ${MESES_MIN[d.getMonth()]}`;
}

export function ordenarTarefas(tarefas: Tarefa[]): Tarefa[] {
  return [...tarefas].sort((a, b) => {
    if (a.feita !== b.feita) return a.feita ? 1 : -1;
    const o = PRIO_ORDEM[a.prioridade] - PRIO_ORDEM[b.prioridade];
    if (o !== 0) return o;
    return a.created_at.localeCompare(b.created_at);
  });
}

export function progressoMeta(m: Meta): number {
  if (m.alvo <= 0) return 0;
  return Math.min(100, (m.atual / m.alvo) * 100);
}

export function conclusaoDoMes(tarefas: Tarefa[], metas: Meta[]): number {
  const pTarefas = tarefas.length
    ? (tarefas.filter((t) => t.feita).length / tarefas.length) * 100
    : null;
  const pMetas = metas.length
    ? metas.reduce((acc, m) => acc + progressoMeta(m), 0) / metas.length
    : null;
  if (pTarefas !== null && pMetas !== null) return (pTarefas + pMetas) / 2;
  return pTarefas ?? pMetas ?? 0;
}
