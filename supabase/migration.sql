-- ================================================================
-- SaaS Ropa — Migration SQL
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 2026-05-29
-- ================================================================

-- ─── EXTENSIONES ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLAS ─────────────────────────────────────────────────────

-- Categorías
CREATE TABLE IF NOT EXISTS categorias (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  imagen_url TEXT,
  orden      INTEGER DEFAULT 0,
  activa     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Productos
CREATE TABLE IF NOT EXISTS productos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  descripcion  TEXT,
  precio       INTEGER NOT NULL CHECK (precio > 0),  -- en centavos
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  imagenes     TEXT[] DEFAULT '{}',                  -- URLs Supabase Storage
  tallas       TEXT[] DEFAULT '{}',                  -- ['XS','S','M','L','XL']
  colores      TEXT[] DEFAULT '{}',                  -- ['blanco','negro','azul']
  stock        INTEGER CHECK (stock >= 0),           -- NULL = sin control de stock
  visible      BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           TEXT UNIQUE NOT NULL,             -- 'ORD-001' legible
  cliente_nombre     TEXT,
  cliente_telefono   TEXT NOT NULL,
  total              INTEGER NOT NULL CHECK (total > 0), -- en centavos
  estado             TEXT NOT NULL DEFAULT 'pendiente'
                     CHECK (estado IN ('pendiente','empaquetado','en_camino','entregado')),
  notas              TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- Items del pedido (snapshot al momento del pedido)
CREATE TABLE IF NOT EXISTS pedido_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id    UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id  UUID REFERENCES productos(id) ON DELETE SET NULL,
  nombre       TEXT NOT NULL,    -- snapshot nombre
  precio       INTEGER NOT NULL, -- snapshot precio en centavos
  talla        TEXT,
  color        TEXT,
  cantidad     INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  subtotal     INTEGER NOT NULL  -- en centavos
);

-- Historial de estados
CREATE TABLE IF NOT EXISTS estado_historial (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id  UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  estado     TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Configuración de la tienda
CREATE TABLE IF NOT EXISTS config (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tienda_nombre       TEXT NOT NULL DEFAULT 'Mi Tienda',
  logo_url            TEXT,
  whatsapp_numero     TEXT NOT NULL,  -- formato: 51987654321
  moneda              TEXT DEFAULT 'PEN',
  whatsapp_template   TEXT DEFAULT
    'Hola! Quiero hacer este pedido 🛍️

#{orderId}

{productos}

Total: S/ {total}

Rastrear mi pedido: {trackingLink}'
);

-- ─── ÍNDICES ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_productos_categoria  ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_visible    ON productos(visible);
CREATE INDEX IF NOT EXISTS idx_productos_slug       ON productos(slug);
CREATE INDEX IF NOT EXISTS idx_pedidos_order_id     ON pedidos(order_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_telefono     ON pedidos(cliente_telefono);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado       ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at   ON pedidos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido  ON pedido_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_historial_pedido     ON estado_historial(pedido_id);

-- ─── FUNCIÓN: auto-ocultar producto con stock = 0 ───────────────

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

CREATE TRIGGER trigger_auto_ocultar
BEFORE UPDATE ON productos
FOR EACH ROW EXECUTE FUNCTION auto_ocultar_sin_stock();

-- ─── FUNCIÓN: auto-registrar historial de estado ────────────────

CREATE OR REPLACE FUNCTION registrar_cambio_estado()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO estado_historial (pedido_id, estado)
    VALUES (NEW.id, NEW.estado);
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_historial_estado
BEFORE UPDATE ON pedidos
FOR EACH ROW EXECUTE FUNCTION registrar_cambio_estado();

-- ─── RLS — HABILITAR ────────────────────────────────────────────

ALTER TABLE categorias       ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE estado_historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE config           ENABLE ROW LEVEL SECURITY;

-- ─── RLS — CATEGORÍAS ───────────────────────────────────────────

-- Lectura pública de categorías activas
CREATE POLICY "categorias_public_read" ON categorias
  FOR SELECT TO anon
  USING (activa = true);

-- Admin acceso total
CREATE POLICY "categorias_admin_all" ON categorias
  FOR ALL TO authenticated USING (true);

-- ─── RLS — PRODUCTOS ────────────────────────────────────────────

-- Lectura pública de productos visibles
CREATE POLICY "productos_public_read" ON productos
  FOR SELECT TO anon
  USING (visible = true);

-- Admin acceso total
CREATE POLICY "productos_admin_all" ON productos
  FOR ALL TO authenticated USING (true);

-- ─── RLS — PEDIDOS ──────────────────────────────────────────────

-- Cliente puede crear pedidos (con rate limit: máx 5 por teléfono en 10 min)
CREATE POLICY "pedidos_insert_rate_limit" ON pedidos
  FOR INSERT TO anon
  WITH CHECK (
    (
      SELECT COUNT(*) FROM pedidos p
      WHERE p.cliente_telefono = cliente_telefono
        AND p.created_at > now() - interval '10 minutes'
    ) < 5
  );

-- Cliente puede leer SU pedido (verificación por order_id + teléfono)
-- Se pasa via SET LOCAL en el Server Action antes de la query
CREATE POLICY "pedidos_select_propio" ON pedidos
  FOR SELECT TO anon
  USING (
    order_id = current_setting('app.order_id', true)
    AND cliente_telefono = current_setting('app.telefono', true)
  );

-- Admin acceso total
CREATE POLICY "pedidos_admin_all" ON pedidos
  FOR ALL TO authenticated USING (true);

-- ─── RLS — PEDIDO_ITEMS ─────────────────────────────────────────

-- Cliente puede insertar items (solo junto con su pedido)
CREATE POLICY "items_insert_anon" ON pedido_items
  FOR INSERT TO anon WITH CHECK (true);

-- Admin acceso total
CREATE POLICY "items_admin_all" ON pedido_items
  FOR ALL TO authenticated USING (true);

-- ─── RLS — HISTORIAL ────────────────────────────────────────────

-- Solo admin puede ver y modificar historial
CREATE POLICY "historial_admin_all" ON estado_historial
  FOR ALL TO authenticated USING (true);

-- ─── RLS — CONFIG ───────────────────────────────────────────────

-- Lectura pública de config (nombre tienda, WhatsApp)
CREATE POLICY "config_public_read" ON config
  FOR SELECT TO anon USING (true);

-- Solo admin puede modificar
CREATE POLICY "config_admin_all" ON config
  FOR ALL TO authenticated USING (true);

-- ─── RLS — STORAGE ──────────────────────────────────────────────
-- Ejecutar después de crear el bucket 'productos' en Storage

-- INSERT INTO storage.buckets (id, name, public) VALUES ('productos', 'productos', true);

CREATE POLICY "storage_public_read" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'productos');

CREATE POLICY "storage_admin_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'productos');

CREATE POLICY "storage_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'productos');

-- ─── DATOS INICIALES ────────────────────────────────────────────

-- Categorías de ejemplo
INSERT INTO categorias (nombre, slug, orden) VALUES
  ('Polos',       'polos',       1),
  ('Jeans',       'jeans',       2),
  ('Vestidos',    'vestidos',    3),
  ('Casacas',     'casacas',     4),
  ('Accesorios',  'accesorios',  5)
ON CONFLICT (slug) DO NOTHING;

-- Config inicial (actualizar con datos reales)
INSERT INTO config (tienda_nombre, whatsapp_numero)
VALUES ('SaaS Ropa', '51987654321')
ON CONFLICT DO NOTHING;

-- ─── FIN ────────────────────────────────────────────────────────
-- Verificar con:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public';
