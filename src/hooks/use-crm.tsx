import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Lead, LeadInput, LeadNote, LeadStatus } from "@/lib/crm";

type CrmContextValue = {
  leads: Lead[];
  notes: LeadNote[];
  loading: boolean;
  saveLead: (input: LeadInput, id?: string) => Promise<Lead | null>;
  moveLead: (lead: Lead, status: LeadStatus) => Promise<void>;
  archiveLead: (lead: Lead) => Promise<void>;
  deleteLead: (lead: Lead) => Promise<boolean>;
  addNote: (leadId: string, texto: string) => Promise<void>;
};

const CrmContext = createContext<CrmContextValue | null>(null);
const saveError = () => toast.error("Não foi possível salvar. Verifique sua conexão.");

export function CrmProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: userData }, leadsResult, notesResult] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
      supabase.from("lead_notes").select("*").order("created_at", { ascending: false }),
    ]);
    setUserId(userData.user?.id ?? null);
    if (leadsResult.error || notesResult.error) toast.error("Não foi possível carregar o CRM.");
    else {
      setLeads((leadsResult.data ?? []) as Lead[]);
      setNotes((notesResult.data ?? []) as LeadNote[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function saveLead(input: LeadInput, id?: string) {
    if (!userId) return null;
    const payload = { ...input, telefone: input.telefone || null, nicho: input.nicho || null, campanha: input.campanha || null, proxima_acao: input.proxima_acao || null, proxima_acao_em: input.proxima_acao_em ? new Date(input.proxima_acao_em).toISOString() : null };
    const query = id
      ? supabase.from("leads").update(payload).eq("id", id)
      : supabase.from("leads").insert({ ...payload, user_id: userId });
    const { data, error } = await query.select().single();
    if (error || !data) { saveError(); return null; }
    const saved = data as Lead;
    setLeads((prev) => id ? prev.map((lead) => lead.id === id ? saved : lead) : [saved, ...prev]);
    toast.success(id ? "Lead atualizado." : "Lead cadastrado.");
    return saved;
  }

  async function moveLead(lead: Lead, status: LeadStatus) {
    if (lead.status === status) return;
    setLeads((prev) => prev.map((item) => item.id === lead.id ? { ...item, status } : item));
    const { error } = await supabase.from("leads").update({ status }).eq("id", lead.id);
    if (error) { setLeads((prev) => prev.map((item) => item.id === lead.id ? lead : item)); saveError(); }
  }

  async function archiveLead(lead: Lead) {
    const next = !lead.arquivado;
    setLeads((prev) => prev.map((item) => item.id === lead.id ? { ...item, arquivado: next } : item));
    const { error } = await supabase.from("leads").update({ arquivado: next }).eq("id", lead.id);
    if (error) { setLeads((prev) => prev.map((item) => item.id === lead.id ? lead : item)); saveError(); }
    else toast.success(next ? "Lead arquivado." : "Lead restaurado.");
  }

  async function deleteLead(lead: Lead) {
    const { error } = await supabase.from("leads").delete().eq("id", lead.id);
    if (error) { saveError(); return false; }
    setLeads((prev) => prev.filter((item) => item.id !== lead.id));
    setNotes((prev) => prev.filter((note) => note.lead_id !== lead.id));
    toast.success("Lead excluído definitivamente.");
    return true;
  }

  async function addNote(leadId: string, texto: string) {
    if (!userId || !texto.trim()) return;
    const { data, error } = await supabase.from("lead_notes").insert({ user_id: userId, lead_id: leadId, texto: texto.trim() }).select().single();
    if (error || !data) { saveError(); return; }
    setNotes((prev) => [data as LeadNote, ...prev]);
  }

  return <CrmContext.Provider value={{ leads, notes, loading, saveLead, moveLead, archiveLead, deleteLead, addNote }}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) throw new Error("useCrm precisa estar dentro de CrmProvider");
  return context;
}
