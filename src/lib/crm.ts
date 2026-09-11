export const CRM_STATUSES = [
  "novo_lead",
  "follow_up",
  "em_abordagem",
  "reuniao_marcada",
  "proposta_enviada",
  "criacao_site",
  "cliente_fechado",
  "perdido_sem_interesse",
  "cliente_perdido",
] as const;

export type LeadStatus = (typeof CRM_STATUSES)[number];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  novo_lead: "Novo Lead",
  follow_up: "Follow Up",
  em_abordagem: "Em Abordagem",
  reuniao_marcada: "Reunião Marcada",
  proposta_enviada: "Proposta Enviada",
  criacao_site: "Criação do Site",
  cliente_fechado: "Cliente Fechado",
  perdido_sem_interesse: "Perdido/Sem Interesse",
  cliente_perdido: "Cliente Perdido (Churn)",
};

export const CRM_ORIGINS = [
  "meta_ads",
  "google_ads",
  "cold_call",
  "indicacao",
  "instagram",
  "prospeccao_manual",
  "outro",
] as const;
export type LeadOrigin = (typeof CRM_ORIGINS)[number];
export const ORIGIN_LABEL: Record<LeadOrigin, string> = {
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  cold_call: "Cold Call",
  indicacao: "Indicação",
  instagram: "Instagram",
  prospeccao_manual: "Prospecção Manual",
  outro: "Outro",
};

export const LEAD_NICHES = [
  "Encanador", "Eletricista", "Reboque", "Clínica", "Dentista", "Advogado",
  "Restaurante", "Loja de roupas", "Imobiliária", "Academia", "Estética", "Outro",
] as const;

export interface Lead {
  id: string;
  user_id: string;
  nome: string;
  telefone: string | null;
  nicho: string | null;
  origem: string;
  campanha: string | null;
  data_entrada: string;
  status: string;
  proxima_acao: string | null;
  proxima_acao_em: string | null;
  arquivado: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: string;
  user_id: string;
  lead_id: string;
  texto: string;
  created_at: string;
}

export type LeadInput = Pick<Lead, "nome" | "telefone" | "nicho" | "origem" | "campanha" | "data_entrada" | "status" | "proxima_acao" | "proxima_acao_em">;

export function statusLabel(status: string) {
  return STATUS_LABEL[status as LeadStatus] ?? status;
}

export function originLabel(origin: string) {
  return ORIGIN_LABEL[origin as LeadOrigin] ?? origin;
}

export function localDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function formatActionDate(value: string | null) {
  if (!value) return "Sem data definida";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
