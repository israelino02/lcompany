import { createFileRoute } from "@tanstack/react-router";
import { Archive, CalendarClock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCrm } from "@/hooks/use-crm";
import { useCrmShell } from "@/components/crm/CrmShell";
import { CRM_STATUSES, STATUS_LABEL, formatActionDate, originLabel } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/crm/leads")({
  head: () => ({ meta: [
    { title: "Leads Ativos — CRM Altivus" },
    { name: "description", content: "Lista de leads ordenada pela próxima ação comercial." },
    { property: "og:title", content: "Leads Ativos — CRM Altivus" },
    { property: "og:description", content: "Gerencie leads, próximas ações, arquivamento e histórico." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LeadsPage,
});

function LeadsPage() {
  const { leads, archiveLead, loading } = useCrm();
  const { openLead } = useCrmShell();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("todos");
  const [showArchived, setShowArchived] = useState(false);
  const filtered = useMemo(() => leads.filter((lead) => lead.arquivado === showArchived && (status === "todos" || lead.status === status) && `${lead.nome} ${lead.telefone ?? ""} ${lead.campanha ?? ""}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => { if (!a.proxima_acao_em) return 1; if (!b.proxima_acao_em) return -1; return a.proxima_acao_em.localeCompare(b.proxima_acao_em); }), [leads, query, status, showArchived]);

  return <main className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6"><div><p className="label-caps text-crm-light">Operação comercial</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{showArchived ? "Leads arquivados" : "Leads ativos"}</h1><p className="mt-1 text-sm text-muted-foreground">Ordenados pela próxima ação mais urgente.</p></div>
    <div className="mt-6 flex flex-wrap gap-2"><label className="relative min-w-[220px] flex-1"><Search size={15} className="absolute left-3 top-3 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar nome, telefone ou campanha" className="h-10 w-full rounded-md border border-border bg-surface-2 pl-9 pr-3 text-sm" /></label><select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-md border border-border bg-surface-2 px-3 text-xs"><option value="todos">Todos os status</option>{CRM_STATUSES.map((item) => <option key={item} value={item}>{STATUS_LABEL[item]}</option>)}</select><Button type="button" variant="outline" onClick={() => setShowArchived((value) => !value)}><Archive /> {showArchived ? "Ver ativos" : "Ver arquivados"}</Button></div>
    {loading ? <p className="mt-7 text-sm text-muted-foreground">Carregando leads…</p> : filtered.length === 0 ? <div className="mt-8 border-t border-dashed border-border py-12 text-center"><p className="text-sm font-medium">Nenhum lead encontrado.</p><p className="mt-1 text-xs text-muted-foreground">Ajuste os filtros ou cadastre um novo lead.</p></div> : <div className="mt-5 overflow-hidden rounded-md border border-border"><div className="hidden grid-cols-[1.4fr_1fr_1fr_1.2fr_auto] gap-4 border-b border-border bg-card px-4 py-3 text-[10px] font-semibold uppercase text-muted-foreground md:grid"><span>Lead</span><span>Origem</span><span>Status</span><span>Próxima ação</span><span>Ações</span></div>{filtered.map((lead) => <article key={lead.id} className="grid gap-3 border-b border-border bg-card/55 px-4 py-4 last:border-b-0 md:grid-cols-[1.4fr_1fr_1fr_1.2fr_auto] md:items-center md:gap-4"><button type="button" onClick={() => openLead(lead)} className="min-w-0 text-left"><strong className="block truncate text-sm">{lead.nome}</strong><span className="num mt-1 block text-[11px] text-muted-foreground">{lead.telefone || "Sem telefone"}</span></button><div><span className="md:hidden label-caps">Origem · </span><span className="text-xs text-muted-foreground">{originLabel(lead.origem)}</span></div><div><span className="inline-flex rounded bg-crm-soft px-2 py-1 text-[10px] font-semibold text-crm-light">{STATUS_LABEL[lead.status as keyof typeof STATUS_LABEL] ?? lead.status}</span></div><div><p className="flex items-center gap-1.5 text-xs text-crm-light"><CalendarClock size={13} /> {formatActionDate(lead.proxima_acao_em)}</p>{lead.proxima_acao && <p className="mt-1 truncate text-[11px] text-muted-foreground">{lead.proxima_acao}</p>}</div><div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => openLead(lead)}>Abrir</Button><Button type="button" size="icon" variant="ghost" onClick={() => void archiveLead(lead)} aria-label={lead.arquivado ? `Restaurar ${lead.nome}` : `Arquivar ${lead.nome}`} title={lead.arquivado ? "Restaurar" : "Arquivar"}><Archive /></Button></div></article>)}</div>}
  </main>;
}
