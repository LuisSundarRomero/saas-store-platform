-- ============================================================
-- Migración: Split tabla config en 5 tablas especializadas
-- Cada tabla tiene tenant_id como PRIMARY KEY (una fila por tenant)
-- Usar UPSERT (ON CONFLICT tenant_id DO UPDATE) para guardar
-- ============================================================

-- ─── TIENDA ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS config_tienda (
  tenant_id       UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  tienda_nombre   TEXT    DEFAULT '',
  whatsapp_numero TEXT    DEFAULT '',
  moneda          TEXT    DEFAULT 'PEN',
  email_notif     TEXT,
  empresa_razon   TEXT,
  empresa_ruc     TEXT,
  empresa_dir     TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── ANUNCIO ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS config_anuncio (
  tenant_id  UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  visible    BOOLEAN     DEFAULT false,
  texto      TEXT        DEFAULT '',
  link       TEXT,
  expira     TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── BANNER ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS config_banner (
  tenant_id        UUID    PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  hero_badge       TEXT    DEFAULT '',
  hero_titulo      TEXT    DEFAULT '',
  hero_subtitulo   TEXT    DEFAULT '',
  hero_boton       TEXT    DEFAULT 'Ver colección →',
  hero_visible     BOOLEAN DEFAULT true,
  imagenes_visible BOOLEAN DEFAULT true,
  imagenes         TEXT[]  DEFAULT '{}',
  imagenes_links   TEXT[]  DEFAULT '{}',
  strip_visible    BOOLEAN DEFAULT true,
  strip_item1      TEXT    DEFAULT '',
  strip_item2      TEXT    DEFAULT '',
  strip_item3      TEXT    DEFAULT '',
  strip_item4      TEXT    DEFAULT '',
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── FOOTER ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS config_footer (
  tenant_id   UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  descripcion TEXT DEFAULT '',
  politica    TEXT DEFAULT '',
  info1       TEXT DEFAULT '',
  info2       TEXT DEFAULT '',
  info3       TEXT DEFAULT '',
  info4       TEXT DEFAULT '',
  email       TEXT,
  tagline     TEXT DEFAULT '',
  instagram   TEXT,
  tiktok      TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── MENSAJES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS config_mensajes (
  tenant_id         UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  whatsapp_template TEXT DEFAULT '',
  updated_at        TIMESTAMPTZ DEFAULT now()
);


-- ─── MIGRAR DATOS DE LA TABLA VIEJA ────────────────────────
INSERT INTO config_tienda (tenant_id, tienda_nombre, whatsapp_numero, moneda, email_notif, empresa_razon, empresa_ruc, empresa_dir)
  SELECT tenant_id,
         COALESCE(tienda_nombre,''),
         COALESCE(whatsapp_numero,''),
         COALESCE(moneda,'PEN'),
         email_notificaciones,
         empresa_razon_social,
         empresa_ruc,
         empresa_direccion
  FROM config
ON CONFLICT DO NOTHING;

INSERT INTO config_anuncio (tenant_id, visible, texto, link, expira)
  SELECT tenant_id,
         COALESCE(anuncio_visible, false),
         COALESCE(anuncio_texto,''),
         anuncio_link,
         anuncio_expira
  FROM config
ON CONFLICT DO NOTHING;

INSERT INTO config_banner (tenant_id, hero_badge, hero_titulo, hero_subtitulo, hero_boton, hero_visible, imagenes_visible, imagenes, imagenes_links, strip_visible, strip_item1, strip_item2, strip_item3, strip_item4)
  SELECT tenant_id,
         COALESCE(hero_badge,''),
         COALESCE(hero_titulo,''),
         COALESCE(hero_subtitulo,''),
         COALESCE(hero_boton,'Ver colección →'),
         COALESCE(hero_visible, true),
         COALESCE(hero_imagenes_visible, true),
         COALESCE(banner_imagenes, '{}'),
         COALESCE(banner_links, '{}'),
         COALESCE(strip_visible, true),
         COALESCE(strip_item1,''),
         COALESCE(strip_item2,''),
         COALESCE(strip_item3,''),
         COALESCE(strip_item4,'')
  FROM config
ON CONFLICT DO NOTHING;

INSERT INTO config_footer (tenant_id, descripcion, politica, info1, info2, info3, info4, email, tagline, instagram, tiktok)
  SELECT tenant_id,
         COALESCE(footer_descripcion,''),
         COALESCE(footer_politica,''),
         COALESCE(footer_info1,''),
         COALESCE(footer_info2,''),
         COALESCE(footer_info3,''),
         COALESCE(footer_info4,''),
         footer_email,
         COALESCE(footer_tagline,''),
         redes_instagram,
         redes_tiktok
  FROM config
ON CONFLICT DO NOTHING;

INSERT INTO config_mensajes (tenant_id, whatsapp_template)
  SELECT tenant_id, COALESCE(whatsapp_template,'')
  FROM config
ON CONFLICT DO NOTHING;


-- ─── RLS ───────────────────────────────────────────────────
-- service_role (createAdminClient) bypasa RLS — todo nuestro código lo usa
-- Se agrega policy para auth por si acaso se usa el cliente normal

ALTER TABLE config_tienda   ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_anuncio  ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_banner   ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_footer   ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_mensajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "config_tienda_auth"   ON config_tienda   FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt()->'user_metadata'->>'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt()->'user_metadata'->>'tenant_id'));

CREATE POLICY "config_anuncio_auth"  ON config_anuncio  FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt()->'user_metadata'->>'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt()->'user_metadata'->>'tenant_id'));

CREATE POLICY "config_banner_auth"   ON config_banner   FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt()->'user_metadata'->>'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt()->'user_metadata'->>'tenant_id'));

CREATE POLICY "config_footer_auth"   ON config_footer   FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt()->'user_metadata'->>'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt()->'user_metadata'->>'tenant_id'));

CREATE POLICY "config_mensajes_auth" ON config_mensajes FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt()->'user_metadata'->>'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt()->'user_metadata'->>'tenant_id'));
