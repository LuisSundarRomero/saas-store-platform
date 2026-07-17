-- ============================================================
-- Módulo: Campos de checkout configurables por tienda
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 2026-07-17
-- ============================================================
-- Cada tenant define qué campos pide el mini-formulario de WhatsApp del
-- carrito (Plan Básico), más allá de nombre/celular que son fijos.
-- Por defecto se siembran: DNI, Distrito, Dirección, Modo de envío
-- (select). El admin tiene CRUD completo: puede editar, desactivar,
-- reordenar o eliminar cualquiera, incluidos los de por defecto.
-- ============================================================

CREATE TABLE IF NOT EXISTS campos_checkout (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  label       TEXT NOT NULL,
  tipo        TEXT NOT NULL DEFAULT 'texto' CHECK (tipo IN ('texto', 'select')),
  placeholder TEXT NOT NULL DEFAULT '',
  opciones    JSONB NOT NULL DEFAULT '[]'::jsonb,
  requerido   BOOLEAN NOT NULL DEFAULT true,
  activo      BOOLEAN NOT NULL DEFAULT true,
  orden       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, key)
);

CREATE INDEX IF NOT EXISTS idx_campos_checkout_tenant ON campos_checkout(tenant_id, orden);

-- Respuestas del cliente para estos campos, guardadas por pedido.
-- JSONB flexible porque los campos son 100% dinámicos (el admin puede
-- agregar/renombrar/eliminar cualquiera en cualquier momento) — no tiene
-- sentido una columna fija por campo.
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS campos_respuestas JSONB NOT NULL DEFAULT '{}'::jsonb;

-- ─── SEED: campos por defecto para tenants existentes ──────────

INSERT INTO campos_checkout (tenant_id, key, label, tipo, placeholder, opciones, requerido, orden)
SELECT t.id, v.key, v.label, v.tipo, v.placeholder, v.opciones::jsonb, v.requerido, v.orden
FROM tenants t
CROSS JOIN (VALUES
  ('dni',        'DNI',           'texto',  'Ej: 12345678',       '[]', true, 1),
  ('distrito',   'Distrito',      'texto',  'Ej: Miraflores',     '[]', true, 2),
  ('direccion',  'Dirección',     'texto',  'Calle, número, referencia', '[]', true, 3),
  ('modo_envio', 'Modo de envío', 'select', '',                   '[]', true, 4)
) AS v(key, label, tipo, placeholder, opciones, requerido, orden)
ON CONFLICT (tenant_id, key) DO NOTHING;

-- ─── RLS ──────────────────────────────────────────────────────

ALTER TABLE campos_checkout ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campos_checkout_public_read" ON campos_checkout;
CREATE POLICY "campos_checkout_public_read" ON campos_checkout
  FOR SELECT TO anon
  USING (tenant_id::text = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS "campos_checkout_admin_all" ON campos_checkout;
CREATE POLICY "campos_checkout_admin_all" ON campos_checkout
  FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

-- ─── VERIFICAR ────────────────────────────────────────────────
-- SELECT t.slug AS tienda, c.key, c.label, c.tipo, c.activo, c.orden
-- FROM campos_checkout c JOIN tenants t ON t.id = c.tenant_id
-- ORDER BY t.slug, c.orden;
