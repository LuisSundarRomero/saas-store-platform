-- ============================================================
-- Módulo: Estados de pedido configurables por tienda
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 2026-06-29
-- ============================================================
-- Cada tenant puede crear/editar/eliminar/ocultar/reordenar sus propios
-- estados de pedido. Los estados "de sistema" (pendiente, pago_confirmado,
-- entregado) están protegidos contra eliminación porque tienen lógica
-- especial en el código (insert inicial, comprobante de pago, estado final).
-- ============================================================

CREATE TABLE IF NOT EXISTS estados_pedido (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  slug                  TEXT NOT NULL,
  label                 TEXT NOT NULL,
  emoji                 TEXT NOT NULL DEFAULT '📦',
  color_bg              TEXT NOT NULL DEFAULT '#F3F4F6',
  color_text            TEXT NOT NULL DEFAULT '#374151',
  orden                 INTEGER NOT NULL DEFAULT 0,
  es_sistema            BOOLEAN NOT NULL DEFAULT false,
  requiere_comprobante  BOOLEAN NOT NULL DEFAULT false,
  notificar_whatsapp    BOOLEAN NOT NULL DEFAULT true,
  mensaje_whatsapp      TEXT NOT NULL DEFAULT '',
  visible               BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_estados_pedido_tenant ON estados_pedido(tenant_id, orden);

-- FK lógico desde pedidos.estado (no se agrega FK física para no romper
-- el insert atómico de checkout — se valida a nivel de aplicación).

-- ─── SEED: estados por defecto para tenants existentes ──────

INSERT INTO estados_pedido (tenant_id, slug, label, emoji, color_bg, color_text, orden, es_sistema, requiere_comprobante, mensaje_whatsapp)
SELECT t.id, v.slug, v.label, v.emoji, v.color_bg, v.color_text, v.orden, v.es_sistema, v.requiere_comprobante, v.mensaje_whatsapp
FROM tenants t
CROSS JOIN (VALUES
  ('pendiente',       'Pendiente',       '⏳', '#FEF3C7', '#92400E', 1, true,  false, 'Tu pedido está siendo revisado.'),
  ('pago_confirmado', 'Pago confirmado', '💳', '#FEE2E2', '#991B1B', 2, true,  true,  'Hemos recibido tu pago. ¡Gracias!'),
  ('empaquetado',     'Empaquetado',     '📦', '#DBEAFE', '#1D4ED8', 3, false, false, 'Tu pedido ya está empaquetado y listo para salir.'),
  ('en_camino',       'En camino',       '🚚', '#EDE9FE', '#5B21B6', 4, false, false, '¡Tu pedido está en camino! Pronto llegará a ti.'),
  ('entregado',       'Entregado',       '✅', '#D1FAE5', '#065F46', 5, true,  false, '¡Tu pedido fue entregado! Esperamos que lo disfrutes.')
) AS v(slug, label, emoji, color_bg, color_text, orden, es_sistema, requiere_comprobante, mensaje_whatsapp)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- ─── RLS ──────────────────────────────────────────────────────

ALTER TABLE estados_pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estados_pedido_public_read" ON estados_pedido
  FOR SELECT TO anon
  USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY "estados_pedido_admin_all" ON estados_pedido
  FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

-- ─── VERIFICAR ────────────────────────────────────────────────
-- SELECT t.slug AS tienda, e.slug, e.label, e.orden, e.es_sistema
-- FROM estados_pedido e JOIN tenants t ON t.id = e.tenant_id
-- ORDER BY t.slug, e.orden;
