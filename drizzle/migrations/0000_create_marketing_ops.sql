-- MEMBERS
CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  accent text NOT NULL DEFAULT 'slate',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members readable by authenticated" ON public.members FOR SELECT TO authenticated USING (true);
CREATE POLICY "members writable by authenticated" ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- TASKS
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'backlog',
  priority text NOT NULL DEFAULT 'normal',
  assignee_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  campaign text,
  channel text,
  tags text[] NOT NULL DEFAULT '{}',
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  progress integer NOT NULL DEFAULT 0,
  position integer NOT NULL DEFAULT 0,
  due_date date,
  blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks readable by authenticated" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "tasks writable by authenticated" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- EVENTS
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  start_time text,
  end_time text,
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'reuniao',
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events readable by authenticated" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events writable by authenticated" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SEED MEMBERS
INSERT INTO public.members (id, name, email, role, accent) VALUES
 ('11111111-1111-1111-1111-111111111101','Mariana','mariana@literare.com','manager','lilac'),
 ('11111111-1111-1111-1111-111111111102','Clara','clara@literare.com','member','pink'),
 ('11111111-1111-1111-1111-111111111103','João','joao@literare.com','member','green'),
 ('11111111-1111-1111-1111-111111111104','Bruno','bruno@literare.com','member','yellow'),
 ('11111111-1111-1111-1111-111111111105','Amanda','amanda@literare.com','admin','grey');

-- SEED TASKS
INSERT INTO public.tasks (title, status, priority, assignee_id, campaign, channel, tags, progress, position, due_date, checklist) VALUES
 ('Planejar campanha de Black Friday','backlog','alta','11111111-1111-1111-1111-111111111101','Black Friday','Meta Ads','{"Meta Ads","Conteúdo"}',10,0,'2026-10-12','[{"label":"Briefing","done":true},{"label":"Copy","done":false}]'),
 ('Briefing campanha institucional','backlog','normal','11111111-1111-1111-1111-111111111103','Institucional','Vídeo','{"Vídeo"}',0,1,'2026-10-20','[]'),
 ('Definir calendário editorial','backlog','normal','11111111-1111-1111-1111-111111111102','Conteúdo','Instagram','{"Conteúdo","Instagram"}',25,2,'2026-10-02','[]'),
 ('Pesquisa de concorrentes','backlog','baixa','11111111-1111-1111-1111-111111111104','Inteligência','SEO','{"SEO"}',0,3,NULL,'[]'),
 ('Campanha lançamento do livro','planejamento','alta','11111111-1111-1111-1111-111111111101','Dia do Livro','Instagram','{"Instagram","Design"}',40,0,'2026-09-30','[{"label":"Briefing","done":true},{"label":"Design","done":false}]'),
 ('Planejamento Instagram Outubro','planejamento','normal','11111111-1111-1111-1111-111111111102','Social','Instagram','{"Instagram","Conteúdo"}',35,1,'2026-09-28','[]'),
 ('Estratégia de e-mail marketing','planejamento','normal','11111111-1111-1111-1111-111111111105','CRM','E-mail','{"E-mail","CRM"}',20,2,'2026-10-05','[]'),
 ('Briefing Google Ads','planejamento','baixa','11111111-1111-1111-1111-111111111104','Performance','Google Ads','{"Google Ads"}',15,3,'2026-10-08','[]'),
 ('Criar peças para Instagram','producao','alta','11111111-1111-1111-1111-111111111102','Dia do Livro','Instagram','{"Design","Instagram"}',65,0,'2026-09-26','[{"label":"Briefing","done":true},{"label":"Copy","done":true},{"label":"Design","done":false}]'),
 ('Landing Page campanha','producao','alta','11111111-1111-1111-1111-111111111103','Dia do Livro','Site','{"Site","Design"}',55,1,'2026-09-24','[]'),
 ('Criar disparo de e-mail','producao','normal','11111111-1111-1111-1111-111111111105','CRM','E-mail','{"E-mail"}',45,2,'2026-09-29','[]'),
 ('Editar vídeo institucional','producao','normal','11111111-1111-1111-1111-111111111104','Institucional','Vídeo','{"Vídeo"}',30,3,'2026-10-03','[]'),
 ('Criar banners para site','producao','baixa','11111111-1111-1111-1111-111111111101','Sempre-verde','Site','{"Design","Site"}',20,4,'2026-10-06','[]'),
 ('Produzir carrossel Instagram','producao','normal','11111111-1111-1111-1111-111111111102','Social','Instagram','{"Instagram"}',50,5,'2026-09-27','[]'),
 ('Aprovação campanha Meta Ads','aprovacao','alta','11111111-1111-1111-1111-111111111101','Performance','Meta Ads','{"Meta Ads"}',80,0,'2026-09-25','[]'),
 ('Aprovação arte Instagram','aprovacao','normal','11111111-1111-1111-1111-111111111102','Social','Instagram','{"Design"}',85,1,'2026-09-25','[]'),
 ('Revisão newsletter','aprovacao','normal','11111111-1111-1111-1111-111111111105','CRM','E-mail','{"E-mail","Conteúdo"}',75,2,'2026-09-26','[]'),
 ('Aprovação landing page','aprovacao','alta','11111111-1111-1111-1111-111111111103','Dia do Livro','Site','{"Site"}',90,3,'2026-09-23','[]'),
 ('Campanha Setembro','concluido','normal','11111111-1111-1111-1111-111111111101','Setembro','Meta Ads','{"Meta Ads"}',100,0,'2026-09-15','[]'),
 ('Newsletter semanal','concluido','baixa','11111111-1111-1111-1111-111111111105','CRM','E-mail','{"E-mail"}',100,1,'2026-09-18','[]'),
 ('Criativos Meta Ads','concluido','normal','11111111-1111-1111-1111-111111111102','Performance','Meta Ads','{"Design"}',100,2,'2026-09-12','[]'),
 ('Landing Page autor','concluido','normal','11111111-1111-1111-1111-111111111103','Institucional','Site','{"Site"}',100,3,'2026-09-10','[]');

-- SEED EVENTS
INSERT INTO public.events (title, event_date, start_time, end_time, member_id, category) VALUES
 ('Reunião de campanha','2026-09-25','14:00','15:00','11111111-1111-1111-1111-111111111101','reuniao'),
 ('Aprovação criativos','2026-09-25','16:30','17:00','11111111-1111-1111-1111-111111111102','entrega'),
 ('Planejamento Outubro','2026-09-28','10:00','11:30','11111111-1111-1111-1111-111111111103','planejamento'),
 ('Call com agência','2026-09-30','09:00','09:30','11111111-1111-1111-1111-111111111104','call'),
 ('Lançamento Dia do Livro','2026-10-01','08:00','18:00','11111111-1111-1111-1111-111111111105','evento');