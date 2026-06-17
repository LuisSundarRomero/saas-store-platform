-- ============================================================
-- Migración: Llaves Culqi por tenant
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 2026-06-16
-- ============================================================

-- Agregar columnas de integración Culqi a la tabla tenants
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS culqi_public_key  TEXT,
  ADD COLUMN IF NOT EXISTS culqi_secret_key  TEXT;

-- Agregar tenant_id a pedido_items si no lo tiene (fix para inserts sin tenant_id)
-- (solo por seguridad, ya debería existir de la migración anterior)
ALTER TABLE pedido_items
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Índice para queries de pedido_items por tenant
CREATE INDEX IF NOT EXISTS pedido_items_tenant_id_idx ON pedido_items(tenant_id);
