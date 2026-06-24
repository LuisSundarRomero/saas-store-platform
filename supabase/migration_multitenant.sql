-- ============================================================
-- SaaS Store Platform — Migración Multi-Tenant
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 2026-06-15
-- ============================================================
-- IMPORTANTE: Ejecutar en orden. No saltear secciones.
-- Este script convierte el schema single-tenant de Anarchy
-- a una arquitectura multi-tenant con tenant_id en todas las tablas.
-- ============================================================


-- ─── 1. TABLA: planes ───────────────────────────────────────
-- Define los planes de suscripción del SaaS

CREATE TABLE IF NOT EXISTS planes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           TEXT NOT NULL,            -- 'basico', 'pro'
  label            TEXT NOT NULL,            -- 'Básico', 'Pro'
  max_productos    INTEGER,                  -- NULL = ilimitado
  max_categorias   INTEGER,                  -- NULL = ilimitado
  precio_mensual   INTEGER NOT NULL DEFAULT 0, -- en centavos PEN
  activo           BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now()
);

INSERT INTO planes (nombre, label, max_productos, max_categorias, precio_mensual) VALUES
  ('basico', 'Básico', 50,   10,  6900),   -- S/ 69/mes
  ('pro',    'Pro',    NULL, NULL, 9900)   -- S/ 99/mes
ON CONFLICT DO NOTHING;


-- ─── 2. TABLA: tenants ──────────────────────────────────────
-- Cada fila es una tienda cliente

CREATE TABLE IF NOT EXISTS tenants (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,    -- 'anarchy' → anarchy.contahorro.com
  nombre            TEXT NOT NULL,
  logo_url          TEXT,
  color_primario    TEXT DEFAULT '#000000',
  color_secundario  TEXT DEFAULT '#ffffff',
  whatsapp          TEXT,                    -- formato: 51987654321
  email_admin       TEXT,                    -- email del dueño de la tienda
  plan_id           UUID REFERENCES planes(id),
  activo            BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Insertar Anarchy como primer tenant
INSERT INTO tenants (slug, nombre, color_primario, whatsapp, email_admin)
VALUES ('anarchy', 'Anarchyy', '#E11D2E', '51987654321', 'sundarluis98@gmail.com')
ON CONFLICT (slug) DO NOTHING;


-- ─── 3. TABLA: suscripciones ────────────────────────────────
-- Historial de suscripciones por tenant

CREATE TABLE IF NOT EXISTS suscripciones (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id           UUID NOT NULL REFERENCES planes(id),
  estado            TEXT NOT NULL DEFAULT 'activo'
                    CHECK (estado IN ('activo', 'vencido', 'cancelado')),
  fecha_inicio      TIMESTAMPTZ DEFAULT now(),
  fecha_vencimiento TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now()
);


-- ─── 4. AGREGAR tenant_id A TABLAS EXISTENTES ───────────────
-- Paso 1: agregar columna nullable
-- Paso 2: rellenar con el tenant de Anarchy
-- Paso 3: hacer NOT NULL

-- CATEGORIAS
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
UPDATE categorias SET tenant_id = (SELECT id FROM tenants WHERE slug = 'anarchy') WHERE tenant_id IS NULL;
ALTER TABLE categorias ALTER COLUMN tenant_id SET NOT NULL;

-- PRODUCTOS
ALTER TABLE productos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
UPDATE productos SET tenant_id = (SELECT id FROM tenants WHERE slug = 'anarchy') WHERE tenant_id IS NULL;
ALTER TABLE productos ALTER COLUMN tenant_id SET NOT NULL;

-- PEDIDOS
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
UPDATE pedidos SET tenant_id = (SELECT id FROM tenants WHERE slug = 'anarchy') WHERE tenant_id IS NULL;
ALTER TABLE pedidos ALTER COLUMN tenant_id SET NOT NULL;

-- PEDIDO_ITEMS (hereda tenant via pedido, pero lo ponemos directo para queries simples)
ALTER TABLE pedido_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
UPDATE pedido_items SET tenant_id = (
  SELECT p.tenant_id FROM pedidos p WHERE p.id = pedido_items.pedido_id
) WHERE tenant_id IS NULL;
ALTER TABLE pedido_items ALTER COLUMN tenant_id SET NOT NULL;

-- ESTADO_HISTORIAL
ALTER TABLE estado_historial ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
UPDATE estado_historial SET tenant_id = (
  SELECT p.tenant_id FROM pedidos p WHERE p.id = estado_historial.pedido_id
) WHERE tenant_id IS NULL;
ALTER TABLE estado_historial ALTER COLUMN tenant_id SET NOT NULL;

-- CONFIG
ALTER TABLE config ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
UPDATE config SET tenant_id = (SELECT id FROM tenants WHERE slug = 'anarchy') WHERE tenant_id IS NULL;
ALTER TABLE config ALTER COLUMN tenant_id SET NOT NULL;


-- ─── 5. ARREGLAR UNIQUE CONSTRAINTS ─────────────────────────
-- slug debe ser único POR TENANT, no globalmente

-- Categorias: slug único por tenant
ALTER TABLE categorias DROP CONSTRAINT IF EXISTS categorias_slug_key;
ALTER TABLE categorias ADD CONSTRAINT categorias_slug_tenant_unique UNIQUE (tenant_id, slug);

-- Productos: slug único por tenant
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_slug_key;
ALTER TABLE productos ADD CONSTRAINT productos_slug_tenant_unique UNIQUE (tenant_id, slug);

-- Pedidos: order_id único por tenant
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_order_id_key;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_order_id_tenant_unique UNIQUE (tenant_id, order_id);


-- ─── 6. ÍNDICES CON tenant_id ────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_categorias_tenant       ON categorias(tenant_id);
CREATE INDEX IF NOT EXISTS idx_productos_tenant        ON productos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_productos_tenant_slug   ON productos(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_pedidos_tenant          ON pedidos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_tenant     ON pedido_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_historial_tenant        ON estado_historial(tenant_id);
CREATE INDEX IF NOT EXISTS idx_config_tenant           ON config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug            ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_suscripciones_tenant    ON suscripciones(tenant_id);


-- ─── 7. RLS — HABILITAR EN NUEVAS TABLAS ────────────────────

ALTER TABLE tenants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones  ENABLE ROW LEVEL SECURITY;


-- ─── 8. RLS — ELIMINAR POLICIES VIEJAS ──────────────────────
-- Las policies actuales no filtran por tenant, hay que reemplazarlas

DROP POLICY IF EXISTS "categorias_public_read"  ON categorias;
DROP POLICY IF EXISTS "categorias_admin_all"    ON categorias;
DROP POLICY IF EXISTS "productos_public_read"   ON productos;
DROP POLICY IF EXISTS "productos_admin_all"     ON productos;
DROP POLICY IF EXISTS "pedidos_insert_rate_limit" ON pedidos;
DROP POLICY IF EXISTS "pedidos_select_propio"   ON pedidos;
DROP POLICY IF EXISTS "pedidos_admin_all"       ON pedidos;
DROP POLICY IF EXISTS "items_insert_anon"       ON pedido_items;
DROP POLICY IF EXISTS "items_admin_all"         ON pedido_items;
DROP POLICY IF EXISTS "historial_admin_all"     ON estado_historial;
DROP POLICY IF EXISTS "config_public_read"      ON config;
DROP POLICY IF EXISTS "config_admin_all"        ON config;


-- ─── 9. RLS — NUEVAS POLICIES MULTI-TENANT ──────────────────
-- El tenant activo se pasa via: SET LOCAL app.tenant_id = '...' en cada Server Action
-- El admin autenticado tiene su tenant_id en user_metadata de Supabase Auth

-- Helper: tenant_id del usuario autenticado
-- Se guarda en raw_user_meta_data → { "tenant_id": "uuid" }

-- ── CATEGORIAS ──

CREATE POLICY "categorias_public_read" ON categorias
  FOR SELECT TO anon
  USING (
    activa = true
    AND tenant_id::text = current_setting('app.tenant_id', true)
  );

CREATE POLICY "categorias_admin_all" ON categorias
  FOR ALL TO authenticated
  USING (
    tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  )
  WITH CHECK (
    tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  );

-- ── PRODUCTOS ──

CREATE POLICY "productos_public_read" ON productos
  FOR SELECT TO anon
  USING (
    visible = true
    AND tenant_id::text = current_setting('app.tenant_id', true)
  );

CREATE POLICY "productos_admin_all" ON productos
  FOR ALL TO authenticated
  USING (
    tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  )
  WITH CHECK (
    tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  );

-- ── PEDIDOS ──

CREATE POLICY "pedidos_insert_anon" ON pedidos
  FOR INSERT TO anon
  WITH CHECK (
    tenant_id::text = current_setting('app.tenant_id', true)
    AND (
      SELECT COUNT(*) FROM pedidos p
      WHERE p.cliente_telefono = cliente_telefono
        AND p.tenant_id::text = current_setting('app.tenant_id', true)
        AND p.created_at > now() - interval '10 minutes'
    ) < 5
  );

CREATE POLICY "pedidos_select_propio" ON pedidos
  FOR SELECT TO anon
  USING (
    tenant_id::text = current_setting('app.tenant_id', true)
    AND order_id = current_setting('app.order_id', true)
    AND cliente_telefono = current_setting('app.telefono', true)
  );

CREATE POLICY "pedidos_admin_all" ON pedidos
  FOR ALL TO authenticated
  USING (
    tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  )
  WITH CHECK (
    tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  );

-- ── PEDIDO_ITEMS ──

CREATE POLICY "items_insert_anon" ON pedido_items
  FOR INSERT TO anon
  WITH CHECK (
    tenant_id::text = current_setting('app.tenant_id', true)
  );

CREATE POLICY "items_select_anon" ON pedido_items
  FOR SELECT TO anon
  USING (
    tenant_id::text = current_setting('app.tenant_id', true)
  );

CREATE POLICY "items_admin_all" ON pedido_items
  FOR ALL TO authenticated
  USING (
    tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  )
  WITH CHECK (
    tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  );

-- ── ESTADO_HISTORIAL ──

CREATE POLICY "historial_admin_all" ON estado_historial
  FOR ALL TO authenticated
  USING (
    tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  )
  WITH CHECK (
    tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  );

-- ── CONFIG ──

CREATE POLICY "config_public_read" ON config
  FOR SELECT TO anon
  USING (
    tenant_id::text = current_setting('app.tenant_id', true)
  );

CREATE POLICY "config_admin_all" ON config
  FOR ALL TO authenticated
  USING (
    tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  )
  WITH CHECK (
    tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  );

-- ── TENANTS (solo super admin puede ver todos) ──

CREATE POLICY "tenants_public_read_activo" ON tenants
  FOR SELECT TO anon
  USING (activo = true);

CREATE POLICY "tenants_admin_own" ON tenants
  FOR SELECT TO authenticated
  USING (
    id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  );

-- ── PLANES (lectura pública) ──

CREATE POLICY "planes_public_read" ON planes
  FOR SELECT TO anon USING (activo = true);

CREATE POLICY "planes_authenticated_read" ON planes
  FOR SELECT TO authenticated USING (activo = true);

-- ── SUSCRIPCIONES ──

CREATE POLICY "suscripciones_admin_own" ON suscripciones
  FOR ALL TO authenticated
  USING (
    tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  )
  WITH CHECK (
    tenant_id::text = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')
  );


-- ─── 10. ACTUALIZAR FUNCIÓN: auto-ocultar sin stock ─────────
-- Agregar tenant_id al contexto (la función en sí no cambia, el trigger sigue igual)

CREATE OR REPLACE FUNCTION auto_ocultar_sin_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock IS NOT NULL AND NEW.stock = 0 THEN
    NEW.visible = false;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ─── 11. ASIGNAR PLAN A ANARCHY ──────────────────────────────

INSERT INTO suscripciones (tenant_id, plan_id, estado, fecha_inicio)
SELECT
  t.id,
  p.id,
  'activo',
  now()
FROM tenants t, planes p
WHERE t.slug = 'anarchy' AND p.nombre = 'pro'
ON CONFLICT DO NOTHING;

UPDATE tenants
SET plan_id = (SELECT id FROM planes WHERE nombre = 'pro')
WHERE slug = 'anarchy';


-- ─── 12. ELIMINAR CONSTRAINT SINGLETON DE CONFIG ────────────
-- config_singleton_unique fue creado para el setup mono-tenant original.
-- En multi-tenant cada tenant tiene su propia fila → la constraint rompe INSERTs.

ALTER TABLE config DROP CONSTRAINT IF EXISTS config_singleton_unique;
ALTER TABLE config DROP COLUMN IF EXISTS singleton;


-- ─── 13. FUENTES POR TENANT ──────────────────────────────────
-- Permite que cada tenant tenga su propia tipografía (Google Fonts).
-- Vacío = usa las fuentes por defecto del sistema (Anton / Inter).

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS font_display TEXT DEFAULT '';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS font_body    TEXT DEFAULT '';


-- ─── FIN ─────────────────────────────────────────────────────
-- Verificar con:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public';
-- SELECT slug, nombre, activo FROM tenants;
-- SELECT nombre, max_productos, precio_mensual FROM planes;
