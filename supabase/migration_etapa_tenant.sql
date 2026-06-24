-- ============================================================
-- Agregar campo etapa al lifecycle de tenants
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 2026-06-18
-- ============================================================

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS etapa TEXT DEFAULT 'demo'
  CHECK (etapa IN ('demo', 'desarrollo', 'pruebas', 'pago', 'produccion'));

-- Verificar:
-- SELECT slug, nombre, etapa FROM tenants ORDER BY created_at DESC;
