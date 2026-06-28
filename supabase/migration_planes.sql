-- ================================================================
-- Migración: Tabla planes + plan_id en tenants
-- Ejecutar en: Supabase → SQL Editor
-- ================================================================

-- ── 1. TABLA planes ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS planes (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         TEXT        NOT NULL UNIQUE,   -- slug: 'gratuito', 'basico', 'pro'
  label          TEXT        NOT NULL,           -- 'Gratuito', 'Básico', 'Pro'
  descripcion    TEXT,
  precio_mensual INTEGER     NOT NULL DEFAULT 0, -- centavos PEN (0 = gratis)
  color          TEXT        NOT NULL DEFAULT '#6366f1', -- badge color hex
  activo         BOOLEAN     NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. PLANES INICIALES ─────────────────────────────────────────

INSERT INTO planes (nombre, label, descripcion, precio_mensual, color) VALUES
  ('basico', 'Básico', 'Plan de inicio para tiendas pequeñas en crecimiento.',        6900, '#f59e0b'),
  ('pro',    'Pro',    'Plan completo con todas las funciones y soporte prioritario.', 9900, '#6366f1')
ON CONFLICT (nombre) DO NOTHING;

-- ── 3. COLUMNA plan_id EN tenants ──────────────────────────────

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES planes(id) ON DELETE SET NULL;

-- ── 4. RLS ─────────────────────────────────────────────────────

ALTER TABLE planes ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer planes activos (el storefront los muestra en pricing)
DROP POLICY IF EXISTS "planes_public_read" ON planes;
CREATE POLICY "planes_public_read" ON planes
  FOR SELECT TO anon USING (activo = true);

DROP POLICY IF EXISTS "planes_authenticated_read" ON planes;
CREATE POLICY "planes_authenticated_read" ON planes
  FOR SELECT TO authenticated USING (true);

-- ── VERIFICAR ───────────────────────────────────────────────────
-- SELECT nombre, label, precio_mensual, activo FROM planes ORDER BY precio_mensual;
-- SELECT slug, nombre, plan_id FROM tenants;
