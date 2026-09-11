export type Agencia = "diretos" | "nautico" | "henrique";

export interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  agencia: string;
  servico: string | null;
  mensal: number | null;
  dia_pagamento: string | null;
  ativo: boolean;
  observacao: string | null;
  ordem: number;
  created_at: string;
}

export interface Checagem {
  id: string;
  user_id: string;
  cliente_id: string;
  data: string;
}

export const AGENCIAS: Agencia[] = ["diretos", "nautico", "henrique"];

export const AGENCIA_LABEL: Record<string, string> = {
  diretos: "Clientes diretos (IL MKT)",
  nautico: "Agência Náutico",
  henrique: "Agência Henrique",
};

export const AGENCIA_CURTA: Record<string, string> = {
  diretos: "Diretos",
  nautico: "Náutico",
  henrique: "Henrique",
};

/** Valor fixo por bloco quando o pagamento não é por conta. */
export const BLOCO_FIXO: Record<string, number | null> = {
  diretos: null,
  nautico: null,
  henrique: 800,
};

export function brl(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: v % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function receitaBloco(agencia: string, clientes: Cliente[]): number {
  const fixo = BLOCO_FIXO[agencia];
  if (fixo != null) return fixo;
  return clientes
    .filter((c) => c.ativo && c.agencia === agencia)
    .reduce((s, c) => s + Number(c.mensal ?? 0), 0);
}

export function receitaTotal(clientes: Cliente[]): number {
  return AGENCIAS.reduce((s, a) => s + receitaBloco(a, clientes), 0);
}
