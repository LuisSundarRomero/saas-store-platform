-- ================================================================
-- SaaS Ropa — Limpieza y corrección del schema
-- Ejecutar en: Supabase → SQL Editor
-- ================================================================
-- Qué hace este script:
--   1. Elimina tablas sin uso: suscripciones, planes, config (legacy)
--   2. Quita columna plan_id de tenants (FK a planes)
--   3. Garantiza columnas de tenants que usa el middleware
--   4. Crea libro_reclamaciones (faltaba en el schema)
-- ================================================================


-- ── 1. ELIMINAR TABLAS SIN USO ─────────────────────────────────

-- suscripciones referencia tenants y planes → borrar primero
DROP TABLE IF EXISTS suscripciones;

-- quitar FK antes de borrar planes
ALTER TABLE tenants DROP COLUMN IF EXISTS plan_id;

DROP TABLE IF EXISTS planes;

-- config es la tabla monolítica original, reemplazada por config_tienda,
-- config_anuncio, config_banner, config_footer y config_mensajes
DROP TABLE IF EXISTS config CASCADE;


-- ── 2. GARANTIZAR COLUMNAS DE TENANTS ──────────────────────────
-- El middleware selecciona estas columnas; pueden faltar en instancias
-- creadas antes de las migraciones correspondientes.

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS font_display TEXT        DEFAULT '',
  ADD COLUMN IF NOT EXISTS font_body    TEXT        DEFAULT '',
  ADD COLUMN IF NOT EXISTS theme        TEXT        DEFAULT 'dark',
  ADD COLUMN IF NOT EXISTS etapa        TEXT        DEFAULT 'demo';

-- Constraint de etapa (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tenants_etapa_check'
  ) THEN
    ALTER TABLE tenants
      ADD CONSTRAINT tenants_etapa_check
      CHECK (etapa IN ('demo', 'desarrollo', 'pruebas', 'pago', 'produccion'));
  END IF;
END$$;


-- ── 3. CREAR libro_reclamaciones ───────────────────────────────
-- Esta tabla es usada por src/lib/actions/reclamaciones.ts
-- (crearReclamo, getReclamaciones, getReclamacion, responderReclamo)
-- pero nunca fue definida en las migraciones.

-- Forzar recreación para garantizar el schema correcto en re-ejecuciones
DROP TABLE IF EXISTS libro_reclamaciones CASCADE;

CREATE TABLE libro_reclamaciones (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  numero               INTEGER     GENERATED ALWAYS AS IDENTITY UNIQUE,
  tenant_id            UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  consumidor_nombre    TEXT        NOT NULL,
  consumidor_domicilio TEXT        NOT NULL,
  consumidor_tipo_doc  TEXT        NOT NULL
                                   CHECK (consumidor_tipo_doc IN ('DNI', 'CE', 'Pasaporte')),
  consumidor_num_doc   TEXT        NOT NULL,
  consumidor_email     TEXT        NOT NULL,
  consumidor_telefono  TEXT,
  tutor_nombre         TEXT,
  bien_tipo            TEXT        NOT NULL
                                   CHECK (bien_tipo IN ('producto', 'servicio')),
  bien_descripcion     TEXT        NOT NULL,
  monto_reclamado      INTEGER,                    -- centavos PEN, nullable (quejas no tienen monto)
  tipo                 TEXT        NOT NULL
                                   CHECK (tipo IN ('reclamo', 'queja')),
  detalle              TEXT        NOT NULL,
  pedido               TEXT        NOT NULL DEFAULT '',
  estado               TEXT        NOT NULL DEFAULT 'pendiente'
                                   CHECK (estado IN ('pendiente', 'atendido')),
  respuesta            TEXT,
  respondido_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_libro_rec_tenant_fecha
  ON libro_reclamaciones (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_libro_rec_estado
  ON libro_reclamaciones (tenant_id, estado);


-- ── 4. RLS para libro_reclamaciones ────────────────────────────

ALTER TABLE libro_reclamaciones ENABLE ROW LEVEL SECURITY;

-- Admins autenticados ven solo sus reclamaciones
DROP POLICY IF EXISTS "admin lee sus reclamaciones"     ON libro_reclamaciones;
DROP POLICY IF EXISTS "admin actualiza sus reclamaciones" ON libro_reclamaciones;

CREATE POLICY "admin lee sus reclamaciones"
  ON libro_reclamaciones
  FOR SELECT
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

CREATE POLICY "admin actualiza sus reclamaciones"
  ON libro_reclamaciones
  FOR UPDATE
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

-- INSERT lo hace la action con service_role (bypasea RLS),
-- así clientes no autenticados pueden enviar reclamaciones.


-- ── VERIFICACIÓN FINAL ─────────────────────────────────────────
-- Ejecuta esto después para confirmar el estado:
--
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--   ORDER BY table_name;
--
-- Resultado esperado (11 tablas):
--   categorias, config_anuncio, config_banner, config_footer,
--   config_mensajes, config_tienda, estado_historial,
--   libro_reclamaciones, pedido_items, pedidos, productos, tenants
