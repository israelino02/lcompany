import { useEffect, useState } from "react";
import { Archive, RotateCcw, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CRM_ORIGINS, CRM_STATUSES, LEAD_NICHES, ORIGIN_LABEL, STATUS_LABEL, localDateTime, type Lead, type LeadInput } from "@/lib/crm";
import { useCrm } from "@/hooks/use-crm";

const inputClass = "h-10 w-full rounded-md border border-border bg-surface-2 px-3 text-sm outline-none";
const today = () => new Date().toISOString().slice(0, 10);

function emptyLead(): LeadInput {
  return { nome: "", telefone: "", nicho: "", origem: "outro", campanha: "", data_entrada: today(), status: "novo_lead", proxima_acao: "", proxima_acao_em: "" };
}

export function LeadDialog({ open, lead, onOpenChange }: { open: boolean; lead: Lead | null; onOpenChange: (open: boolean) => void }) {
  const { notes, saveLead, archiveLead, deleteLead, addNote } = useCrm();
  const [form, setForm] = useState<LeadInput>(emptyLead());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setForm(lead ? { nome: lead.nome, telefone: lead.telefone ?? "", nicho: lead.nicho ?? "", origem: lead.origem, campanha: lead.campanha ?? "", data_entrada: lead.data_entrada, status: lead.status, proxima_acao: lead.proxima_acao ?? "", proxima_acao_em: localDateTime(lead.proxima_acao_em) } : emptyLead());
    setNote("");
  }, [lead, open]);

  const field = (key: keyof LeadInput, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const leadNotes = lead ? notes.filter((item) => item.lead_id === lead.id) : [];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.nome.trim()) return;
    setSaving(true);
    const saved = await saveLead({ ...form, nome: form.nome.trim() }, lead?.id);
    setSaving(false);
    if (saved) onOpenChange(false);
  }

  async function submitNote() {
    if (!lead || !note.trim()) return;
    await addNote(lead.id, note);
    setNote("");
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-card sm:max-w-3xl">
          <DialogHeader><DialogTitle>{lead ? "Detalhes do lead" : "Novo lead"}</DialogTitle><DialogDescription>Dados comerciais e próxima ação.</DialogDescription></DialogHeader>
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-muted-foreground">Nome / Empresa<input className={`${inputClass} mt-1`} value={form.nome} onChange={(e) => field("nome", e.target.value)} required /></label>
              <label className="text-xs text-muted-foreground">Telefone<input className={`${inputClass} mt-1 num`} value={form.telefone ?? ""} onChange={(e) => field("telefone", e.target.value)} placeholder="(00) 00000-0000" /></label>
              <label className="text-xs text-muted-foreground">Nicho<select className={`${inputClass} mt-1`} value={form.nicho ?? ""} onChange={(e) => field("nicho", e.target.value)}><option value="">Selecione</option>{LEAD_NICHES.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="text-xs text-muted-foreground">Origem<select className={`${inputClass} mt-1`} value={form.origem} onChange={(e) => field("origem", e.target.value)}>{CRM_ORIGINS.map((item) => <option key={item} value={item}>{ORIGIN_LABEL[item]}</option>)}</select></label>
              <label className="text-xs text-muted-foreground">Campanha<input className={`${inputClass} mt-1`} value={form.campanha ?? ""} onChange={(e) => field("campanha", e.target.value)} /></label>
              <label className="text-xs text-muted-foreground">Data de entrada<input type="date" className={`${inputClass} mt-1 num`} value={form.data_entrada} onChange={(e) => field("data_entrada", e.target.value)} /></label>
              <label className="text-xs text-muted-foreground">Status<select className={`${inputClass} mt-1`} value={form.status} onChange={(e) => field("status", e.target.value)}>{CRM_STATUSES.map((item) => <option key={item} value={item}>{STATUS_LABEL[item]}</option>)}</select></label>
              <label className="text-xs text-muted-foreground">Data da próxima ação<input type="datetime-local" className={`${inputClass} mt-1 num`} value={form.proxima_acao_em ?? ""} onChange={(e) => field("proxima_acao_em", e.target.value)} /></label>
            </div>
            <label className="text-xs text-muted-foreground">Próxima ação<textarea className="mt-1 min-h-20 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none" value={form.proxima_acao ?? ""} onChange={(e) => field("proxima_acao", e.target.value)} placeholder="Ex.: ligar para confirmar a reunião" /></label>
            <DialogFooter className="gap-2">
              {lead && <><Button type="button" variant="outline" onClick={async () => { await archiveLead(lead); onOpenChange(false); }}>{lead.arquivado ? <RotateCcw /> : <Archive />}{lead.arquivado ? "Restaurar" : "Arquivar"}</Button><Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)}><Trash2 /> Excluir</Button></>}
              <Button type="submit" disabled={saving} className="bg-crm text-background hover:bg-crm-light">{saving ? "Salvando…" : "Salvar lead"}</Button>
            </DialogFooter>
          </form>
          {lead && <section className="mt-2 border-t border-border pt-5"><h3 className="label-caps text-crm-light">Histórico de observações</h3><div className="mt-3 flex gap-2"><textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-20 flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm" placeholder="Escreva uma observação…" /><Button type="button" size="icon" onClick={submitNote} aria-label="Adicionar observação" title="Adicionar observação" className="bg-crm text-background hover:bg-crm-light"><Send /></Button></div><div className="mt-4 space-y-2">{leadNotes.length === 0 ? <p className="text-xs text-muted-foreground">Nenhuma observação registrada.</p> : leadNotes.map((item) => <article key={item.id} className="rounded-md border border-border bg-surface-2 p-3"><time className="num text-[10px] text-muted-foreground">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.created_at))}</time><p className="mt-1 whitespace-pre-wrap text-sm">{item.texto}</p></article>)}</div></section>}
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}><AlertDialogContent className="border-border bg-card"><AlertDialogHeader><AlertDialogTitle>Excluir lead definitivamente?</AlertDialogTitle><AlertDialogDescription>O lead e todo o histórico de observações serão apagados. Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive text-foreground hover:bg-destructive/90" onClick={async () => { if (lead && await deleteLead(lead)) onOpenChange(false); }}>Excluir definitivamente</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </>
  );
}
