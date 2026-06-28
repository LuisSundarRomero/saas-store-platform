-- ============================================================
-- Migración: Sección "Nosotros" configurable por tenant
-- ============================================================

CREATE TABLE IF NOT EXISTS config_nosotros (
  tenant_id    UUID    PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  visible      BOOLEAN DEFAULT false,
  titulo       TEXT    DEFAULT 'Sobre nosotros',
  subtitulo    TEXT    DEFAULT '',
  descripcion  TEXT    DEFAULT '',
  imagen_url   TEXT,
  valor1_ico   TEXT    DEFAULT '',
  valor1_tit   TEXT    DEFAULT '',
  valor1_desc  TEXT    DEFAULT '',
  valor2_ico   TEXT    DEFAULT '',
  valor2_tit   TEXT    DEFAULT '',
  valor2_desc  TEXT    DEFAULT '',
  valor3_ico   TEXT    DEFAULT '',
  valor3_tit   TEXT    DEFAULT '',
  valor3_desc  TEXT    DEFAULT '',
  updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE config_nosotros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "config_nosotros_auth" ON config_nosotros FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt()->'user_metadata'->>'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt()->'user_metadata'->>'tenant_id'));
