
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'comercial', 'operacao', 'financeiro');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + admin role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  -- First user gets admin role
  IF (SELECT count(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Billboards table
CREATE TABLE public.billboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  city text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  route text NOT NULL DEFAULT '',
  address text DEFAULT '',
  type text NOT NULL DEFAULT 'painel_rodoviario',
  dimension text DEFAULT '9x3m',
  area double precision DEFAULT 27,
  direction text DEFAULT '',
  estimated_flow integer DEFAULT 0,
  audience_profile text DEFAULT '',
  seasonality text DEFAULT 'media',
  traffic_type text DEFAULT '',
  land_owner text DEFAULT '',
  land_owner_id uuid,
  cost numeric DEFAULT 0,
  price numeric DEFAULT 0,
  production_cost numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'available',
  photos text[] DEFAULT '{}',
  description text DEFAULT '',
  formats text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view billboards" ON public.billboards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert billboards" ON public.billboards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update billboards" ON public.billboards FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete billboards" ON public.billboards FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
-- Public read for site
CREATE POLICY "Public can view available billboards" ON public.billboards FOR SELECT TO anon USING (status = 'available');

-- Clients table
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text DEFAULT '',
  document text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  type text NOT NULL DEFAULT 'advertiser',
  address text DEFAULT '',
  history text[] DEFAULT '{}',
  billboard_ids text[] DEFAULT '{}',
  contract_ids text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage clients" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Leads table
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  contact text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  stage text NOT NULL DEFAULT 'lead',
  value numeric DEFAULT 0,
  billboard_ids text[] DEFAULT '{}',
  notes text DEFAULT '',
  origin text DEFAULT 'site',
  interactions jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage leads" ON public.leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Public insert for site form
CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT TO anon WITH CHECK (true);

-- Contracts table
CREATE TABLE public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'veiculacao',
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name text DEFAULT '',
  billboard_ids text[] DEFAULT '{}',
  start_date date NOT NULL,
  end_date date NOT NULL,
  monthly_value numeric DEFAULT 0,
  total_value numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  renewal_type text DEFAULT 'manual',
  payment_method text DEFAULT '',
  document_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage contracts" ON public.contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Work Orders table
CREATE TABLE public.work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'installation',
  billboard_id uuid REFERENCES public.billboards(id) ON DELETE SET NULL,
  billboard_code text DEFAULT '',
  client_name text DEFAULT '',
  assignee text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  due_date date NOT NULL,
  completed_date date,
  sla_hours integer DEFAULT 48,
  checklist jsonb DEFAULT '[]',
  photos_before text[] DEFAULT '{}',
  photos_after text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage work_orders" ON public.work_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
