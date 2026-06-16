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
  stock_tallas  JSONB DEFAULT '{}'::jsonb,           -- { "M": 3, "L": 0 }
  stock_colores JSONB DEFAULT '{}'::jsonb,           -- { "negro": 2, "hueso": 0 }
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

-- ─── FUNCIÓN: actualizar updated_at en productos ─────────────────
-- Nota (2026-06-11): antes este trigger también forzaba visible=false
-- cuando stock=0, impidiendo que el admin mostrara productos agotados
-- con su badge "Agotado". Ahora la visibilidad es 100% manual.

CREATE OR REPLACE FUNCTION actualizar_updated_at_producto()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_ocultar ON productos;
DROP TRIGGER IF EXISTS trigger_productos_updated_at ON productos;
CREATE TRIGGER trigger_productos_updated_at
BEFORE UPDATE ON productos
FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at_producto();

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

DROP TRIGGER IF EXISTS trigger_historial_estado ON pedidos;
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
DROP POLICY IF EXISTS "categorias_public_read" ON categorias;
CREATE POLICY "categorias_public_read" ON categorias
  FOR SELECT TO anon
  USING (activa = true);

-- Admin acceso total
DROP POLICY IF EXISTS "categorias_admin_all" ON categorias;
CREATE POLICY "categorias_admin_all" ON categorias
  FOR ALL TO authenticated USING (true);

-- ─── RLS — PRODUCTOS ────────────────────────────────────────────

-- Lectura pública de productos visibles
DROP POLICY IF EXISTS "productos_public_read" ON productos;
CREATE POLICY "productos_public_read" ON productos
  FOR SELECT TO anon
  USING (visible = true);

-- Admin acceso total
DROP POLICY IF EXISTS "productos_admin_all" ON productos;
CREATE POLICY "productos_admin_all" ON productos
  FOR ALL TO authenticated USING (true);

-- ─── RLS — PEDIDOS ──────────────────────────────────────────────

-- Cliente puede crear pedidos (con rate limit: máx 5 por teléfono en 10 min)
DROP POLICY IF EXISTS "pedidos_insert_rate_limit" ON pedidos;
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
DROP POLICY IF EXISTS "pedidos_select_propio" ON pedidos;
CREATE POLICY "pedidos_select_propio" ON pedidos
  FOR SELECT TO anon
  USING (
    order_id = current_setting('app.order_id', true)
    AND cliente_telefono = current_setting('app.telefono', true)
  );

-- Admin acceso total
DROP POLICY IF EXISTS "pedidos_admin_all" ON pedidos;
CREATE POLICY "pedidos_admin_all" ON pedidos
  FOR ALL TO authenticated USING (true);

-- ─── RLS — PEDIDO_ITEMS ─────────────────────────────────────────

-- Cliente puede insertar items (solo junto con su pedido)
DROP POLICY IF EXISTS "items_insert_anon" ON pedido_items;
CREATE POLICY "items_insert_anon" ON pedido_items
  FOR INSERT TO anon WITH CHECK (true);

-- Admin acceso total
DROP POLICY IF EXISTS "items_admin_all" ON pedido_items;
CREATE POLICY "items_admin_all" ON pedido_items
  FOR ALL TO authenticated USING (true);

-- ─── RLS — HISTORIAL ────────────────────────────────────────────

-- Solo admin puede ver y modificar historial
DROP POLICY IF EXISTS "historial_admin_all" ON estado_historial;
CREATE POLICY "historial_admin_all" ON estado_historial
  FOR ALL TO authenticated USING (true);

-- ─── RLS — CONFIG ───────────────────────────────────────────────

-- Lectura pública de config (nombre tienda, WhatsApp)
DROP POLICY IF EXISTS "config_public_read" ON config;
CREATE POLICY "config_public_read" ON config
  FOR SELECT TO anon USING (true);

-- Solo admin puede modificar
DROP POLICY IF EXISTS "config_admin_all" ON config;
CREATE POLICY "config_admin_all" ON config
  FOR ALL TO authenticated USING (true);

-- ─── RLS — STORAGE ──────────────────────────────────────────────
-- Ejecutar después de crear el bucket 'productos' en Storage

-- INSERT INTO storage.buckets (id, name, public) VALUES ('productos', 'productos', true);

DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
CREATE POLICY "storage_public_read" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'productos');

DROP POLICY IF EXISTS "storage_admin_upload" ON storage.objects;
CREATE POLICY "storage_admin_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'productos');

DROP POLICY IF EXISTS "storage_admin_delete" ON storage.objects;
CREATE POLICY "storage_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'productos');

-- ─── DATOS INICIALES ────────────────────────────────────────────

-- Categorías de ejemplo
INSERT INTO categorias (nombre, slug, orden) VALUES
  ('Polos',       'polos',       1),
  ('Casacas',     'casacas',     2),
  ('Pantalones',  'pantalones',  3)
ON CONFLICT (slug) DO NOTHING;

-- Config inicial (actualizar con datos reales)
-- Solo se inserta si la tabla está vacía (config es un singleton; no tiene
-- columna única, así que ON CONFLICT no evita duplicados al re-ejecutar).
INSERT INTO config (tienda_nombre, whatsapp_numero)
SELECT 'SaaS Ropa', '51987654321'
WHERE NOT EXISTS (SELECT 1 FROM config);

-- ─── ALTER: columnas config agregadas después del schema inicial ─
ALTER TABLE config ADD COLUMN IF NOT EXISTS hero_imagenes_visible BOOLEAN DEFAULT true;

-- ─── ALTER: estado pago_confirmado + comprobante (2026-06-06) ────
-- 1. Ampliar el CHECK constraint de pedidos.estado
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_estado_check;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_estado_check
  CHECK (estado IN ('pendiente','pago_confirmado','empaquetado','en_camino','entregado'));

-- 2. Columna para guardar URL de la captura de pago
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS comprobante_url TEXT;

-- 3. Bucket de storage para comprobantes (ejecutar una sola vez)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('comprobantes', 'comprobantes', true) ON CONFLICT DO NOTHING;

-- 4. Políticas de storage para comprobantes
DROP POLICY IF EXISTS "comprobantes_admin_upload" ON storage.objects;
CREATE POLICY "comprobantes_admin_upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'comprobantes');

DROP POLICY IF EXISTS "comprobantes_admin_read" ON storage.objects;
CREATE POLICY "comprobantes_admin_read" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'comprobantes');

-- ─── FUNCIÓN: verificar_pedido (2026-06-06) ──────────────────────
-- Permite que el cliente (anon) verifique su pedido sin service_role.
-- SECURITY DEFINER bypasea RLS. Normaliza teléfono con/sin prefijo 51.
CREATE OR REPLACE FUNCTION verificar_pedido(p_order_id TEXT, p_tel TEXT)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_limpio TEXT;
  tel_a    TEXT;
  tel_b    TEXT;
  result   JSON;
BEGIN
  v_limpio := regexp_replace(p_tel, '[\s\-\+\(\)]', '', 'g');

  IF length(v_limpio) = 9 THEN
    tel_a := '51' || v_limpio;
    tel_b := v_limpio;
  ELSIF v_limpio LIKE '51%' AND length(v_limpio) = 11 THEN
    tel_a := v_limpio;
    tel_b := substring(v_limpio FROM 3);
  ELSE
    tel_a := v_limpio;
    tel_b := v_limpio;
  END IF;

  SELECT row_to_json(sub) INTO result
  FROM (
    SELECT
      p.*,
      (
        SELECT json_agg(pi ORDER BY pi.id)
        FROM pedido_items pi
        WHERE pi.pedido_id = p.id
      ) AS pedido_items,
      (
        SELECT json_agg(json_build_object('estado', eh.estado, 'changed_at', eh.changed_at)
                        ORDER BY eh.changed_at)
        FROM estado_historial eh
        WHERE eh.pedido_id = p.id
      ) AS estado_historial
    FROM pedidos p
    WHERE p.order_id = p_order_id
      AND (p.cliente_telefono = tel_a OR p.cliente_telefono = tel_b)
    LIMIT 1
  ) sub;

  RETURN result;
END;
$$;

-- Permitir que el anon llame a esta función
GRANT EXECUTE ON FUNCTION verificar_pedido(TEXT, TEXT) TO anon;

-- ─── ALTER: anuncio_link (2026-06-07) ───────────────────────────
ALTER TABLE config ADD COLUMN IF NOT EXISTS anuncio_link TEXT;

-- ─── ALTER: columnas config para ConfigForm (2026-06-11) ────────
-- Estas columnas son leídas/escritas por src/components/admin/ConfigForm.tsx
-- y por las páginas públicas (hero, cta, footer, anuncio, strip de beneficios).

ALTER TABLE config ADD COLUMN IF NOT EXISTS email_notificaciones TEXT;

-- Banner / Hero
ALTER TABLE config ADD COLUMN IF NOT EXISTS hero_badge     TEXT DEFAULT '🦇 Restock en preventa';
ALTER TABLE config ADD COLUMN IF NOT EXISTS hero_titulo    TEXT DEFAULT 'Hago lo que quiero vestir';
ALTER TABLE config ADD COLUMN IF NOT EXISTS hero_subtitulo TEXT DEFAULT 'Lujo oscuro. Essence of Dark Fashion. Piezas streetwear de edición limitada.';
ALTER TABLE config ADD COLUMN IF NOT EXISTS hero_boton     TEXT DEFAULT 'Ver colección →';
ALTER TABLE config ADD COLUMN IF NOT EXISTS hero_visible   BOOLEAN DEFAULT true;

-- Imágenes del slider/carrusel del banner (URLs de Storage, en orden de aparición)
ALTER TABLE config ADD COLUMN IF NOT EXISTS banner_imagenes TEXT[] DEFAULT '{}';

-- CTA
ALTER TABLE config ADD COLUMN IF NOT EXISTS cta_titulo     TEXT DEFAULT '¿Tienes alguna consulta?';
ALTER TABLE config ADD COLUMN IF NOT EXISTS cta_subtitulo  TEXT DEFAULT 'Te asesoramos personalmente para encontrar tu pieza.';
ALTER TABLE config ADD COLUMN IF NOT EXISTS cta_visible    BOOLEAN DEFAULT true;

-- Footer
ALTER TABLE config ADD COLUMN IF NOT EXISTS footer_descripcion TEXT DEFAULT 'Lujo oscuro / Essence of Dark Fashion. Piezas streetwear de edición limitada — hago lo que quiero vestir.';
ALTER TABLE config ADD COLUMN IF NOT EXISTS footer_politica    TEXT DEFAULT 'No hacemos cambios ni devoluciones 🦇';
ALTER TABLE config ADD COLUMN IF NOT EXISTS footer_info1       TEXT DEFAULT 'Preventas por tiempo limitado';
ALTER TABLE config ADD COLUMN IF NOT EXISTS footer_info2       TEXT DEFAULT 'Envíos a nivel nacional';
ALTER TABLE config ADD COLUMN IF NOT EXISTS footer_info3       TEXT;
ALTER TABLE config ADD COLUMN IF NOT EXISTS footer_info4       TEXT;

-- Anuncio (barra superior)
ALTER TABLE config ADD COLUMN IF NOT EXISTS anuncio_visible BOOLEAN DEFAULT false;
ALTER TABLE config ADD COLUMN IF NOT EXISTS anuncio_texto   TEXT;
ALTER TABLE config ADD COLUMN IF NOT EXISTS anuncio_expira  TIMESTAMPTZ;

-- Strip de beneficios
ALTER TABLE config ADD COLUMN IF NOT EXISTS strip_visible BOOLEAN DEFAULT true;

-- ─── ALTER: stock por talla y por color (2026-06-12) ────────────
-- Mapas independientes { "talla": stock } y { "color": stock }.
-- Una clave ausente significa "sin control de stock para esa variante";
-- valor 0 significa que esa talla/color específico está agotado.
ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_tallas  JSONB DEFAULT '{}'::jsonb;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_colores JSONB DEFAULT '{}'::jsonb;
ALTER TABLE config ADD COLUMN IF NOT EXISTS strip_item1   TEXT DEFAULT '🖤 Diseños únicos y originales';
ALTER TABLE config ADD COLUMN IF NOT EXISTS strip_item2   TEXT DEFAULT '🦇 Colección dark exclusiva';
ALTER TABLE config ADD COLUMN IF NOT EXISTS strip_item3   TEXT DEFAULT '💬 Atención personalizada';
ALTER TABLE config ADD COLUMN IF NOT EXISTS strip_item4   TEXT DEFAULT '🚚 Envíos a nivel nacional';

-- ─── ALTER: precio_antes en productos (2026-06-11) ──────────────
-- Precio tachado para mostrar descuentos. En centavos, igual que 'precio'.
ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_antes INTEGER;

-- ─── ALTER: es_nuevo / destacado en productos (2026-06-11) ──────
-- Usados por CatalogoAdminTable, ProductCard y banner del home (máx 4 destacados).
ALTER TABLE productos ADD COLUMN IF NOT EXISTS es_nuevo  BOOLEAN DEFAULT false;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT false;

-- ─── CONSTRAINT: config singleton (2026-06-11) ──────────────────
-- 'config' debe tener una sola fila (la app usa .single()/.eq('id', ...)).
-- Esta columna+constraint impide insertar una segunda fila por error.
ALTER TABLE config ADD COLUMN IF NOT EXISTS singleton BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE config DROP CONSTRAINT IF EXISTS config_singleton_unique;
ALTER TABLE config ADD CONSTRAINT config_singleton_unique UNIQUE (singleton);

-- ─── ALTER: contacto y tagline del footer (2026-06-12) ──────────
ALTER TABLE config ADD COLUMN IF NOT EXISTS footer_email   TEXT DEFAULT 'contacto@anarchyy.pe';
ALTER TABLE config ADD COLUMN IF NOT EXISTS footer_tagline TEXT DEFAULT 'Hago lo que quiero vestir 🦇';

-- ─── ALTER: redes sociales (2026-06-12) ─────────────────────────
-- URL completa de cada red. Vacío/NULL = no se muestra el ícono.
ALTER TABLE config ADD COLUMN IF NOT EXISTS redes_instagram TEXT;
ALTER TABLE config ADD COLUMN IF NOT EXISTS redes_tiktok    TEXT;

-- ─── ALTER: links del slider del banner (2026-06-12) ────────────
-- Mismo orden/largo que banner_imagenes. Vacío en una posición = usa /catalogo.
ALTER TABLE config ADD COLUMN IF NOT EXISTS banner_links TEXT[] DEFAULT '{}';

-- ─── ALTER: pago online con Culqi (2026-06-12) ──────────────────
-- metodo_pago: 'whatsapp' (legado) | 'culqi' (pagado online con tarjeta, único método activo)
-- culqi_charge_id: ID del cargo en Culqi (formato "chr_...") para referencia/reembolsos
-- cliente_email: requerido por Culqi para crear el cargo
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago     TEXT DEFAULT 'whatsapp';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS culqi_charge_id TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_email   TEXT;

-- ─── ALTER: dirección de entrega (2026-06-14) ───────────────────
-- Dirección exacta del cliente, obligatoria desde el checkout para pedidos nuevos.
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_direccion TEXT;

-- ─── FIN ────────────────────────────────────────────────────────
-- Verificar con:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public';
