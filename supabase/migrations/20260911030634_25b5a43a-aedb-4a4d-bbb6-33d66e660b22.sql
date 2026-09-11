CREATE TABLE public.clientes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  nome text NOT NULL,
  agencia text NOT NULL DEFAULT 'diretos',
  servico text,
  mensal numeric(10,2),
  dia_pagamento text,
  ativo boolean NOT NULL DEFAULT true,
  observacao text,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios gerenciam seus clientes" ON public.clientes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.checagens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  data date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (cliente_id, data)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checagens TO authenticated;
GRANT ALL ON public.checagens TO service_role;
ALTER TABLE public.checagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios gerenciam suas checagens" ON public.checagens FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_clientes_user ON public.clientes(user_id, ordem);
CREATE INDEX idx_checagens_user_data ON public.checagens(user_id, data);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.clientes (user_id, nome, agencia, servico, mensal, dia_pagamento, ativo, ordem) VALUES
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','7 Fios Têxtil','diretos','Google Ads, GMN, Meta Ads, TikTok, Site',1200,'Dia 10',true,1),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Nina Fisioterapeuta','diretos','Meta Ads',1000,'Dia 10',true,2),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Bellart','diretos','Meta Ads',250,'Dia 10',true,3),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Dani — Terapeuta capilar','nautico',NULL,160,'Dia 5 a 10',true,4),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Kargus','nautico',NULL,160,'Dia 5 a 10',true,5),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Wallisson','nautico',NULL,160,'Dia 5 a 10',true,6),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Kâe','nautico',NULL,160,'Dia 5 a 10',true,7),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','DELYCALI','nautico',NULL,160,'Dia 5 a 10',true,8),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Tesourinha','nautico',NULL,160,'Dia 5 a 10',true,9),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Edson','nautico',NULL,160,'Dia 5 a 10',true,10),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Camisas Kenal','nautico',NULL,160,'Dia 5 a 10',true,11),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Larissa — Nutróloga','nautico',NULL,160,'Dia 5 a 10',true,12),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Goiás Peças','nautico',NULL,160,'Dia 5 a 10',true,13),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Anselmi Brand','nautico',NULL,160,'Dia 5 a 10',true,14),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Dr. Júlio','henrique',NULL,NULL,'Dia 24',true,15),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Dr. Thales','henrique',NULL,NULL,'Dia 24',true,16),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Dr. Jonas','henrique',NULL,NULL,'Dia 24',true,17),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','AMBVISION','diretos','Site',500,NULL,false,18),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','Leonardo — LM','diretos','Site',500,NULL,false,19),
('d69b9ac5-f5d3-45a4-a0f3-5ae79d147d62','STOFFLINE (via Matheus)','diretos','Trabalho para amigo',NULL,NULL,false,20);

UPDATE public.clientes SET observacao = 'Finalizado. Fonte de indicação.' WHERE user_id = 'd69b9ac5-f5d3-45a4-a0f3-5ae79d147d62' AND nome IN ('AMBVISION','Leonardo — LM');
UPDATE public.clientes SET observacao = 'Finalizado, sem continuidade.' WHERE user_id = 'd69b9ac5-f5d3-45a4-a0f3-5ae79d147d62' AND nome = 'STOFFLINE (via Matheus)';