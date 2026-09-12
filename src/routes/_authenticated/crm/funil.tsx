import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, ChevronLeft, ChevronRight, GripVertical, MoveHorizontal, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCrm } from "@/hooks/use-crm";
import { useCrmShell } from "@/components/crm/CrmShell";
import { CRM_STATUSES, STATUS_LABEL, formatActionDate, type Lead, type LeadStatus } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/crm/funil")({
  head: () => ({ meta: [
    { title: "Funil de Vendas — CRM Lino Company" },
    { name: "description", content: "Funil comercial visual com movimentação de leads entre etapas." },
    { property: "og:title", content: "Funil de Vendas — CRM Lino Company" },
    { property: "og:description", content: "Acompanhe e mova cada lead pelas etapas do processo comercial." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: FunnelPage,
});

const ORDER_KEY = "crm-funil-colunas";

function loadOrder(): LeadStatus[] {
  try {
    const saved = JSON.parse(window.localStorage.getItem(ORDER_KEY) ?? "null") as string[] | null;
    if (Array.isArray(saved)) {
      const valid = saved.filter((item) => (CRM_STATUSES as readonly string[]).includes(item)) as LeadStatus[];
      const missing = CRM_STATUSES.filter((item) => !valid.includes(item));
      if (valid.length + missing.length === CRM_STATUSES.length) return [...valid, ...missing];
    }
  } catch { /* ignora */ }
  return [...CRM_STATUSES];
}

function FunnelPage() {
  const { leads, moveLead, loading } = useCrm();
  const { openLead } = useCrmShell();
  const [dragged, setDragged] = useState<Lead | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<LeadStatus | null>(null);
  const [order, setOrder] = useState<LeadStatus[]>([...CRM_STATUSES]);
  const active = leads.filter((lead) => !lead.arquivado);

  useEffect(() => { setOrder(loadOrder()); }, []);

  function saveOrder(next: LeadStatus[]) {
    setOrder(next);
    window.localStorage.setItem(ORDER_KEY, JSON.stringify(next));
  }

  function moveColumn(status: LeadStatus, direction: -1 | 1) {
    const index = order.indexOf(status);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    saveOrder(next);
  }

  function dropColumn(target: LeadStatus) {
    if (!draggedColumn || draggedColumn === target) { setDraggedColumn(null); return; }
    const next = order.filter((item) => item !== draggedColumn);
    next.splice(next.indexOf(target), 0, draggedColumn);
    saveOrder(next);
    setDraggedColumn(null);
    toast.success("Ordem do funil atualizada.");
  }

  function resetOrder() {
    saveOrder([...CRM_STATUSES]);
    toast.success("Ordem original restaurada.");
  }

  const isCustomOrder = order.some((status, index) => status !== CRM_STATUSES[index]);

  return <main className="w-full px-4 py-7 sm:px-6"><div className="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-3"><div><p className="label-caps text-crm-light">Pipeline comercial</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Funil</h1><p className="mt-1 text-sm text-muted-foreground">Arraste os leads entre as fases — e arraste o cabeçalho das colunas para reorganizar o pipeline.</p></div>{isCustomOrder && <button type="button" onClick={resetOrder} className="rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground">Restaurar ordem original</button>}</div>
    {loading ? <p className="mx-auto mt-7 max-w-[1500px] text-sm text-muted-foreground">Carregando funil…</p> : <div className="mx-auto mt-6 flex max-w-[1500px] gap-3 overflow-x-auto pb-5">{order.map((status, index) => { const list = active.filter((lead) => lead.status === status); return <section key={status} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedColumn) dropColumn(status); else if (dragged) void moveLead(dragged, status); setDragged(null); }} className={`min-h-[520px] w-[272px] shrink-0 rounded-md border bg-card/55 p-3 transition-colors ${draggedColumn === status ? "border-crm opacity-60" : "border-border"}`}><header className="flex items-center justify-between gap-1"><div draggable onDragStart={() => setDraggedColumn(status)} onDragEnd={() => setDraggedColumn(null)} className="flex min-w-0 flex-1 cursor-grab items-center gap-1.5 active:cursor-grabbing" title="Arraste para mover a coluna"><MoveHorizontal size={12} className="shrink-0 text-muted-foreground" /><h2 className="truncate text-xs font-semibold">{STATUS_LABEL[status]}</h2></div><div className="flex shrink-0 items-center gap-0.5"><button type="button" onClick={() => moveColumn(status, -1)} disabled={index === 0} aria-label={`Mover ${STATUS_LABEL[status]} para a esquerda`} className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"><ChevronLeft size={12} /></button><button type="button" onClick={() => moveColumn(status, 1)} disabled={index === order.length - 1} aria-label={`Mover ${STATUS_LABEL[status]} para a direita`} className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"><ChevronRight size={12} /></button><span className="num rounded bg-surface-2 px-2 py-1 text-[10px] text-muted-foreground">{list.length}</span></div></header><div className="mt-3 space-y-2">{list.map((lead) => <LeadCard key={lead.id} lead={lead} onOpen={() => openLead(lead)} onDrag={() => setDragged(lead)} onMove={(next) => void moveLead(lead, next)} />)}{list.length === 0 && <div className="rounded-md border border-dashed border-border px-3 py-8 text-center text-[11px] text-muted-foreground">Solte um lead aqui</div>}</div></section>; })}</div>}
  </main>;
}

function LeadCard({ lead, onOpen, onDrag, onMove }: { lead: Lead; onOpen: () => void; onDrag: () => void; onMove: (status: LeadStatus) => void }) {
  return <article draggable onDragStart={onDrag} className="cursor-grab rounded-md border border-border bg-surface-2 p-3 active:cursor-grabbing"><button type="button" onClick={onOpen} className="block w-full text-left"><div className="flex items-start gap-2"><GripVertical size={14} className="mt-0.5 shrink-0 text-muted-foreground" /><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{lead.nome}</h3><p className="mt-1 truncate text-[11px] text-muted-foreground">{lead.nicho || "Nicho não informado"}</p></div></div>{lead.telefone && <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground"><Phone size={12} /> {lead.telefone}</p>}<p className="mt-2 flex items-center gap-1.5 text-[11px] text-crm-light"><CalendarClock size={12} /> {formatActionDate(lead.proxima_acao_em)}</p>{lead.proxima_acao && <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{lead.proxima_acao}</p>}</button><label className="sr-only" htmlFor={`status-${lead.id}`}>Mover {lead.nome}</label><select id={`status-${lead.id}`} value={lead.status} onChange={(e) => onMove(e.target.value as LeadStatus)} className="mt-3 h-8 w-full rounded-md border border-border bg-card px-2 text-[10px] text-muted-foreground">{CRM_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}</select></article>;
}
