CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  nome text NOT NULL,
  telefone text,
  nicho text,
  origem text NOT NULL DEFAULT 'outro',
  campanha text,
  data_entrada date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'novo_lead',
  proxima_acao text,
  proxima_acao_em timestamp with time zone,
  arquivado boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT leads_origem_valida CHECK (origem IN ('meta_ads', 'google_ads', 'cold_call', 'indicacao', 'instagram', 'prospeccao_manual', 'outro')),
  CONSTRAINT leads_status_valido CHECK (status IN ('novo_lead', 'follow_up', 'em_abordagem', 'reuniao_marcada', 'proposta_enviada', 'criacao_site', 'cliente_fechado', 'perdido_sem_interesse', 'cliente_perdido')),
  CONSTRAINT leads_id_user_unique UNIQUE (id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gerenciam seus leads"
ON public.leads
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX leads_user_status_idx ON public.leads (user_id, status);
CREATE INDEX leads_user_next_action_idx ON public.leads (user_id, arquivado, proxima_acao_em);

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.lead_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lead_id uuid NOT NULL,
  texto text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lead_notes_lead_owner_fkey FOREIGN KEY (lead_id, user_id)
    REFERENCES public.leads (id, user_id) ON DELETE CASCADE
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_notes TO authenticated;
GRANT ALL ON public.lead_notes TO service_role;

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gerenciam observacoes dos seus leads"
ON public.lead_notes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX lead_notes_lead_created_idx ON public.lead_notes (lead_id, created_at DESC);