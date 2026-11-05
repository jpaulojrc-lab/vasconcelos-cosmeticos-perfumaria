-- =============================================================================
-- VASCONCELOS COSMÉTICOS & ALTA PERFUMARIA — SCHEMA COMPLETO SUPABASE (POSTGRESQL)
-- Todas as tabelas possuem o sufixo "_vasconcelos", RLS (Row Level Security)
-- ativo, políticas de segurança explícitas, índices de performance e dados iniciais.
-- =============================================================================

BEGIN;

-- 1. Função utilitária para atualizar automaticamente a coluna updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_vasconcelos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- TABELA 1: PRODUTOS (products_vasconcelos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products_vasconcelos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  subtitle TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('perfumaria', 'bodysplash', 'skincare', 'maquiagem', 'combos')),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10,2) NOT NULL CHECK (original_price >= 0),
  discount_percent INTEGER DEFAULT 0,
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT NOT NULL DEFAULT '',
  volume TEXT NOT NULL DEFAULT '',
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes JSONB,
  actives JSONB DEFAULT '[]'::jsonb,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_flash_sale BOOLEAN NOT NULL DEFAULT false,
  sold_percentage INTEGER DEFAULT 0,
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_vasconcelos_category ON public.products_vasconcelos(category);
CREATE INDEX IF NOT EXISTS idx_products_vasconcelos_best_seller ON public.products_vasconcelos(is_best_seller);

DROP TRIGGER IF EXISTS trg_products_vasconcelos_updated_at ON public.products_vasconcelos;
CREATE TRIGGER trg_products_vasconcelos_updated_at
BEFORE UPDATE ON public.products_vasconcelos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_vasconcelos();

-- =============================================================================
-- TABELA 2: CLIENTES (customers_vasconcelos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.customers_vasconcelos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  email TEXT NOT NULL UNIQUE CHECK (position('@' in email) > 1),
  avatar TEXT,
  phone TEXT DEFAULT '',
  cpf TEXT DEFAULT '',
  provider TEXT NOT NULL DEFAULT 'email' CHECK (provider IN ('google', 'apple', 'email')),
  password_hash TEXT,
  addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_vasconcelos_email ON public.customers_vasconcelos(lower(email));

DROP TRIGGER IF EXISTS trg_customers_vasconcelos_updated_at ON public.customers_vasconcelos;
CREATE TRIGGER trg_customers_vasconcelos_updated_at
BEFORE UPDATE ON public.customers_vasconcelos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_vasconcelos();

-- =============================================================================
-- TABELA 3: PEDIDOS & PARCELAS (orders_vasconcelos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.orders_vasconcelos (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE CHECK (char_length(trim(order_number)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer JSONB NOT NULL,
  customer_email TEXT GENERATED ALWAYS AS (lower(customer->>'email')) STORED,
  shipping_address JSONB NOT NULL,
  shipping_method JSONB NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  coupon_code TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'credit_card', 'boleto')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'failed')),
  order_status TEXT NOT NULL DEFAULT 'pendente' CHECK (order_status IN ('pendente', 'pago', 'separacao', 'enviado', 'entregue')),
  installments INTEGER NOT NULL DEFAULT 1 CHECK (installments >= 1 AND installments <= 12),
  settled_installments INTEGER NOT NULL DEFAULT 0 CHECK (settled_installments >= 0 AND settled_installments <= 12),
  tracking_code TEXT,
  pix_copia_e_cola TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_vasconcelos_created_at ON public.orders_vasconcelos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_vasconcelos_order_status ON public.orders_vasconcelos(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_vasconcelos_payment_status ON public.orders_vasconcelos(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_vasconcelos_customer_email ON public.orders_vasconcelos(customer_email);

DROP TRIGGER IF EXISTS trg_orders_vasconcelos_updated_at ON public.orders_vasconcelos;
CREATE TRIGGER trg_orders_vasconcelos_updated_at
BEFORE UPDATE ON public.orders_vasconcelos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_vasconcelos();

-- =============================================================================
-- TABELA 4: CUPONS DE DESCONTO (coupons_vasconcelos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.coupons_vasconcelos (
  code TEXT PRIMARY KEY CHECK (char_length(trim(code)) > 0),
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  value NUMERIC(10,2) NOT NULL CHECK (value > 0),
  min_order_value NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (min_order_value >= 0),
  description TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TABELA 5: AVALIAÇÕES DE PRODUTOS (reviews_vasconcelos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.reviews_vasconcelos (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products_vasconcelos(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL CHECK (char_length(trim(user_name)) > 0),
  user_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL DEFAULT '',
  comment TEXT NOT NULL CHECK (char_length(trim(comment)) > 0),
  date_label TEXT NOT NULL DEFAULT 'Hoje',
  verified_purchase BOOLEAN NOT NULL DEFAULT true,
  helpful_count INTEGER NOT NULL DEFAULT 1 CHECK (helpful_count >= 0),
  recommended BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_vasconcelos_product_id ON public.reviews_vasconcelos(product_id);

-- =============================================================================
-- TABELA 6: CONFIGURAÇÕES FINANCEIRAS & TAXAS (financial_settings_vasconcelos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.financial_settings_vasconcelos (
  id TEXT PRIMARY KEY DEFAULT 'default',
  anticipation_mode TEXT NOT NULL DEFAULT 'fluxo_mensal' CHECK (anticipation_mode IN ('fluxo_mensal', 'antecipado_d1')),
  gateway_fees JSONB NOT NULL DEFAULT '{"pixFeePercent": 0.99, "boletoFeeFixed": 3.49, "creditCashFeePercent": 2.99, "creditInstallmentBasePercent": 3.49, "creditInstallmentPerParcelPercent": 1.29, "anticipationExtraPercent": 1.80}'::jsonb,
  settled_installments_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  automation_config JSONB NOT NULL DEFAULT '{"enabled": true, "autoOnCheckout": true, "reminder30m": true, "reminder24h": true}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_financial_settings_vasconcelos_updated_at ON public.financial_settings_vasconcelos;
CREATE TRIGGER trg_financial_settings_vasconcelos_updated_at
BEFORE UPDATE ON public.financial_settings_vasconcelos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_vasconcelos();

-- =============================================================================
-- TABELA 7: HISTÓRICO DE COBRANÇAS (billing_logs_vasconcelos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.billing_logs_vasconcelos (
  id TEXT PRIMARY KEY,
  timestamp_label TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  order_number TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  channel TEXT NOT NULL DEFAULT 'ambos',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_logs_vasconcelos_created_at ON public.billing_logs_vasconcelos(created_at DESC);

-- =============================================================================
-- TABELA 8: NOTIFICAÇÕES DA LOJA (notifications_vasconcelos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notifications_vasconcelos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp_label TEXT NOT NULL DEFAULT 'Agora mesmo',
  read BOOLEAN NOT NULL DEFAULT false,
  discount_code TEXT,
  badge TEXT DEFAULT 'Novidade',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PERMISSÕES DA DATA API (GRANT PARA ROLES ANON E AUTHENTICATED)
-- =============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products_vasconcelos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers_vasconcelos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders_vasconcelos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons_vasconcelos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews_vasconcelos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_settings_vasconcelos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing_logs_vasconcelos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications_vasconcelos TO anon, authenticated;

-- =============================================================================
-- ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) E POLÍTICAS DE SEGURANÇA
-- =============================================================================
ALTER TABLE public.products_vasconcelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers_vasconcelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders_vasconcelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons_vasconcelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews_vasconcelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_settings_vasconcelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_logs_vasconcelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_vasconcelos ENABLE ROW LEVEL SECURITY;

-- Políticas para products_vasconcelos
DROP POLICY IF EXISTS "products_select_policy_vasconcelos" ON public.products_vasconcelos;
CREATE POLICY "products_select_policy_vasconcelos"
  ON public.products_vasconcelos FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "products_write_policy_vasconcelos" ON public.products_vasconcelos;
CREATE POLICY "products_write_policy_vasconcelos"
  ON public.products_vasconcelos FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (price >= 0 AND stock >= 0 AND char_length(trim(name)) > 0);

-- Políticas para customers_vasconcelos
DROP POLICY IF EXISTS "customers_select_policy_vasconcelos" ON public.customers_vasconcelos;
CREATE POLICY "customers_select_policy_vasconcelos"
  ON public.customers_vasconcelos FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "customers_write_policy_vasconcelos" ON public.customers_vasconcelos;
CREATE POLICY "customers_write_policy_vasconcelos"
  ON public.customers_vasconcelos FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (position('@' in email) > 1 AND char_length(trim(name)) > 0);

-- Políticas para orders_vasconcelos
DROP POLICY IF EXISTS "orders_select_policy_vasconcelos" ON public.orders_vasconcelos;
CREATE POLICY "orders_select_policy_vasconcelos"
  ON public.orders_vasconcelos FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "orders_write_policy_vasconcelos" ON public.orders_vasconcelos;
CREATE POLICY "orders_write_policy_vasconcelos"
  ON public.orders_vasconcelos FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (total >= 0 AND installments >= 1 AND installments <= 12);

-- Políticas para coupons_vasconcelos
DROP POLICY IF EXISTS "coupons_select_policy_vasconcelos" ON public.coupons_vasconcelos;
CREATE POLICY "coupons_select_policy_vasconcelos"
  ON public.coupons_vasconcelos FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "coupons_write_policy_vasconcelos" ON public.coupons_vasconcelos;
CREATE POLICY "coupons_write_policy_vasconcelos"
  ON public.coupons_vasconcelos FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (value > 0 AND char_length(trim(code)) > 0);

-- Políticas para reviews_vasconcelos
DROP POLICY IF EXISTS "reviews_select_policy_vasconcelos" ON public.reviews_vasconcelos;
CREATE POLICY "reviews_select_policy_vasconcelos"
  ON public.reviews_vasconcelos FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "reviews_write_policy_vasconcelos" ON public.reviews_vasconcelos;
CREATE POLICY "reviews_write_policy_vasconcelos"
  ON public.reviews_vasconcelos FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (rating >= 1 AND rating <= 5 AND char_length(trim(comment)) > 0);

-- Políticas para financial_settings_vasconcelos
DROP POLICY IF EXISTS "financial_settings_policy_vasconcelos" ON public.financial_settings_vasconcelos;
CREATE POLICY "financial_settings_policy_vasconcelos"
  ON public.financial_settings_vasconcelos FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (anticipation_mode IN ('fluxo_mensal', 'antecipado_d1'));

-- Políticas para billing_logs_vasconcelos
DROP POLICY IF EXISTS "billing_logs_policy_vasconcelos" ON public.billing_logs_vasconcelos;
CREATE POLICY "billing_logs_policy_vasconcelos"
  ON public.billing_logs_vasconcelos FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (amount >= 0);

-- Políticas para notifications_vasconcelos
DROP POLICY IF EXISTS "notifications_policy_vasconcelos" ON public.notifications_vasconcelos;
CREATE POLICY "notifications_policy_vasconcelos"
  ON public.notifications_vasconcelos FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (char_length(trim(title)) > 0);

-- =============================================================================
-- CARGA INICIAL PADRÃO (SEED DATA)
-- =============================================================================
INSERT INTO public.financial_settings_vasconcelos (id, anticipation_mode, settled_installments_map)
VALUES (
  'default',
  'fluxo_mensal',
  '{"ord-1001": 1, "ord-1002": 2, "ord-1003": 1, "ord-1004": 4, "ord-1005": 0}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.coupons_vasconcelos (code, discount_type, value, min_order_value, description, active)
VALUES
  ('BEMVINDO10', 'percentage', 10, 0, '10% OFF na sua primeira compra na Vasconcelos!', true),
  ('VASCONCELOS20', 'percentage', 20, 199, '20% OFF em compras acima de R$ 199!', true),
  ('PERFUME30', 'fixed', 30, 250, 'R$ 30 OFF direto no carrinho para compras acima de R$ 250', true),
  ('FRETEVIP', 'fixed', 25, 120, 'Bônus de R$ 25 para abater no frete ou produtos', true)
ON CONFLICT (code) DO NOTHING;

COMMIT;
