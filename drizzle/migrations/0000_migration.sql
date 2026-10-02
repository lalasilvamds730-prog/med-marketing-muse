CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  nome text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  clinica text NOT NULL DEFAULT '',
  telefone text NOT NULL DEFAULT '',
  area_de_atuacao text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (NEW.id, COALESCE(NEW.email,''), COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  nome text NOT NULL,
  whatsapp text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  servico text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Novo' CHECK (status IN ('Novo','Contato','Agendado','Convertido','Perdido')),
  observacoes text NOT NULL DEFAULT '',
  data_entrada date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.conteudos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  titulo text NOT NULL,
  tema text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT 'Post' CHECK (tipo IN ('Post','Reels','Stories','Vídeo','Artigo','Campanha')),
  data_planejada date,
  status text NOT NULL DEFAULT 'Ideia' CHECK (status IN ('Ideia','Planejado','Publicado')),
  observacoes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  titulo text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  responsavel text NOT NULL DEFAULT '',
  prazo date,
  prioridade text NOT NULL DEFAULT 'Média' CHECK (prioridade IN ('Baixa','Média','Alta')),
  status text NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente','Em andamento','Concluída')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.oportunidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  nome text NOT NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  servico text NOT NULL DEFAULT '',
  valor_estimado numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Nova' CHECK (status IN ('Nova','Em negociação','Agendada','Convertida','Perdida')),
  data date NOT NULL DEFAULT current_date,
  observacoes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.atividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  descricao text NOT NULL,
  tipo text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['leads','conteudos','tarefas','oportunidades','atividades'] LOOP
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  EXECUTE format('CREATE POLICY "own select" ON public.%I FOR SELECT TO authenticated USING (auth.uid() = user_id)', t);
  EXECUTE format('CREATE POLICY "own insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)', t);
  EXECUTE format('CREATE POLICY "own update" ON public.%I FOR UPDATE TO authenticated USING (auth.uid() = user_id)', t);
  EXECUTE format('CREATE POLICY "own delete" ON public.%I FOR DELETE TO authenticated USING (auth.uid() = user_id)', t);
  EXECUTE format('CREATE INDEX ON public.%I (user_id, created_at DESC)', t);
END LOOP; END $$;