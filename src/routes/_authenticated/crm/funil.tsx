import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, GripVertical, Phone } from "lucide-react";
import { useState } from "react";
import { useCrm } from "@/hooks/use-crm";
import { useCrmShell } from "@/components/crm/CrmShell";
import { CRM_STATUSES, STATUS_LABEL, formatActionDate, type Lead, type LeadStatus } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/crm/funil")({
  head: () => ({ meta: [
    { title: "Funil de Vendas — CRM Altivus" },
    { name: "description", content: "Funil comercial visual com movimentação de leads entre etapas." },
    { property: "og:title", content: "Funil de Vendas — CRM Altivus" },
    { property: "og:description", content: "Acompanhe e mova cada lead pelas etapas do processo comercial." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: FunnelPage,
});

function FunnelPage() {
  const { leads, moveLead, loading } = useCrm();
  const { openLead } = useCrmShell();
  const [dragged, setDragged] = useState<Lead | null>(null);
  const active = leads.filter((lead) => !lead.arquivado);

  return <main className="w-full px-4 py-7 sm:px-6"><div className="mx-auto max-w-[1500px]"><p className="label-caps text-crm-light">Pipeline comercial</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Funil</h1><p className="mt-1 text-sm text-muted-foreground">Arraste os leads ou altere a fase pelo seletor do cartão.</p></div>
    {loading ? <p className="mx-auto mt-7 max-w-[1500px] text-sm text-muted-foreground">Carregando funil…</p> : <div className="mx-auto mt-6 flex max-w-[1500px] gap-3 overflow-x-auto pb-5">{CRM_STATUSES.map((status) => { const list = active.filter((lead) => lead.status === status); return <section key={status} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragged) void moveLead(dragged, status); setDragged(null); }} className="min-h-[520px] w-[272px] shrink-0 rounded-md border border-border bg-card/55 p-3"><header className="flex items-center justify-between"><h2 className="text-xs font-semibold">{STATUS_LABEL[status]}</h2><span className="num rounded bg-surface-2 px-2 py-1 text-[10px] text-muted-foreground">{list.length}</span></header><div className="mt-3 space-y-2">{list.map((lead) => <LeadCard key={lead.id} lead={lead} onOpen={() => openLead(lead)} onDrag={() => setDragged(lead)} onMove={(next) => void moveLead(lead, next)} />)}{list.length === 0 && <div className="rounded-md border border-dashed border-border px-3 py-8 text-center text-[11px] text-muted-foreground">Solte um lead aqui</div>}</div></section>; })}</div>}
  </main>;
}

function LeadCard({ lead, onOpen, onDrag, onMove }: { lead: Lead; onOpen: () => void; onDrag: () => void; onMove: (status: LeadStatus) => void }) {
  return <article draggable onDragStart={onDrag} className="cursor-grab rounded-md border border-border bg-surface-2 p-3 active:cursor-grabbing"><button type="button" onClick={onOpen} className="block w-full text-left"><div className="flex items-start gap-2"><GripVertical size={14} className="mt-0.5 shrink-0 text-muted-foreground" /><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{lead.nome}</h3><p className="mt-1 truncate text-[11px] text-muted-foreground">{lead.nicho || "Nicho não informado"}</p></div></div>{lead.telefone && <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground"><Phone size={12} /> {lead.telefone}</p>}<p className="mt-2 flex items-center gap-1.5 text-[11px] text-crm-light"><CalendarClock size={12} /> {formatActionDate(lead.proxima_acao_em)}</p>{lead.proxima_acao && <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{lead.proxima_acao}</p>}</button><label className="sr-only" htmlFor={`status-${lead.id}`}>Mover {lead.nome}</label><select id={`status-${lead.id}`} value={lead.status} onChange={(e) => onMove(e.target.value as LeadStatus)} className="mt-3 h-8 w-full rounded-md border border-border bg-card px-2 text-[10px] text-muted-foreground">{CRM_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}</select></article>;
}
