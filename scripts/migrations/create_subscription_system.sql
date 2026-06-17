-- =============================================================================
-- SUBSCRIPTION SYSTEM MIGRATION
-- =============================================================================
-- Creates all tables needed for the subscription/monetization system
-- Includes: subscriptions, coupons, applied_coupons, plan_history
-- =============================================================================

-- TABLA: subscriptions
-- Almacena la información de suscripción de cada usuario
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_plan TEXT NOT NULL CHECK (current_plan IN ('free', 'pro', 'unicorn', 'lifetime')),
  status TEXT NOT NULL CHECK (status IN ('active', 'grace_period', 'expired', 'canceled')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  renewal_date TIMESTAMPTZ,
  last_billing_date TIMESTAMPTZ,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  wompi_transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_date ON subscriptions(renewal_date);

-- Comentarios
COMMENT ON TABLE subscriptions IS 'Información de suscripciones de usuarios';
COMMENT ON COLUMN subscriptions.current_plan IS 'Plan actual: free, pro, unicorn, lifetime';
COMMENT ON COLUMN subscriptions.status IS 'Estado: active, grace_period, expired, canceled';
COMMENT ON COLUMN subscriptions.renewal_date IS 'Fecha de próxima renovación (NULL para free y lifetime)';

-- =============================================================================

-- TABLA: coupons
-- Catálogo de cupones disponibles en el sistema
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'free_time', 'lifetime')),
  value INTEGER NOT NULL,
  description TEXT,
  applicable_plans TEXT[] CHECK (
    applicable_plans IS NULL OR 
    applicable_plans <@ ARRAY['free', 'pro', 'unicorn', 'lifetime']::TEXT[]
  ),
  expiry_date TIMESTAMPTZ,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsqueda rápida por código
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = true;

-- Comentarios
COMMENT ON TABLE coupons IS 'Catálogo de cupones de descuento';
COMMENT ON COLUMN coupons.type IS 'Tipo: percentage (%), free_time (meses gratis), lifetime (acceso vitalicio)';
COMMENT ON COLUMN coupons.value IS 'Valor del cupón (porcentaje o cantidad de meses)';

-- =============================================================================

-- TABLA: applied_coupons
-- Registro de cupones aplicados a suscripciones
CREATE TABLE IF NOT EXISTS applied_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  coupon_code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'free_time', 'lifetime')),
  value INTEGER NOT NULL,
  applied_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  UNIQUE(subscription_id, coupon_code)
);

-- Índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_applied_coupons_subscription ON applied_coupons(subscription_id);

-- Comentarios
COMMENT ON TABLE applied_coupons IS 'Cupones aplicados a suscripciones de usuarios';

-- =============================================================================

-- TABLA: plan_history
-- Historial de cambios de plan para analytics
CREATE TABLE IF NOT EXISTS plan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  from_plan TEXT NOT NULL CHECK (from_plan IN ('free', 'pro', 'unicorn', 'lifetime')),
  to_plan TEXT NOT NULL CHECK (to_plan IN ('free', 'pro', 'unicorn', 'lifetime')),
  change_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT NOT NULL CHECK (reason IN ('upgrade', 'downgrade', 'expired', 'canceled', 'coupon'))
);

-- Índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_plan_history_subscription ON plan_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_plan_history_date ON plan_history(change_date DESC);

-- Comentarios
COMMENT ON TABLE plan_history IS 'Historial de cambios de plan de usuarios';
COMMENT ON COLUMN plan_history.reason IS 'Razón del cambio: upgrade, downgrade, expired, canceled, coupon';

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE applied_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_history ENABLE ROW LEVEL SECURITY;

-- SUBSCRIPTIONS: Los usuarios solo ven su propia suscripción
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Solo el sistema puede insertar suscripciones (via Edge Functions con service_role)
CREATE POLICY "System can insert subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (false); -- Bloqueado desde client, solo via backend

-- COUPONS: Todos pueden leer cupones activos (para validación)
CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  USING (is_active = true);

-- Solo admins pueden modificar cupones (via service_role)
CREATE POLICY "System can manage coupons"
  ON coupons FOR ALL
  WITH CHECK (false);

-- APPLIED_COUPONS: Los usuarios ven solo sus cupones aplicados
CREATE POLICY "Users can view own applied coupons"
  ON applied_coupons FOR SELECT
  USING (
    subscription_id IN (
      SELECT id FROM subscriptions WHERE user_id = auth.uid()
    )
  );

-- Solo el sistema puede aplicar cupones
CREATE POLICY "System can apply coupons"
  ON applied_coupons FOR INSERT
  WITH CHECK (false);

-- PLAN_HISTORY: Los usuarios ven solo su historial
CREATE POLICY "Users can view own plan history"
  ON plan_history FOR SELECT
  USING (
    subscription_id IN (
      SELECT id FROM subscriptions WHERE user_id = auth.uid()
    )
  );

-- Solo el sistema puede registrar cambios
CREATE POLICY "System can insert plan history"
  ON plan_history FOR INSERT
  WITH CHECK (false);

-- =============================================================================
-- INSERTAR CUPONES DE EJEMPLO (OPCIONAL - COMENTADO)
-- =============================================================================

-- Descomentar para crear cupones de prueba
/*
INSERT INTO coupons (code, type, value, description, is_active) VALUES
  ('WELCOME15', 'percentage', 15, '15% de descuento de bienvenida', true),
  ('LAUNCH70', 'percentage', 70, '70% OFF para early adopters', true),
  ('1MONTHFREE', 'free_time', 1, '1 mes gratis', true),
  ('LEGENDARY', 'lifetime', 0, 'Acceso vitalicio al plan Unicorn', true);
*/

-- =============================================================================
-- FUNCIÓN: Auto-actualizar updated_at en subscriptions
-- =============================================================================

CREATE OR REPLACE FUNCTION update_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscription_timestamp
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscription_timestamp();

-- =============================================================================
-- FIN DE MIGRACIÓN
-- =============================================================================
