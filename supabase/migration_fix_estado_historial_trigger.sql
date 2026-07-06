-- ============================================================
-- FIX CRÍTICO: trigger registrar_cambio_estado() no setea tenant_id
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 2026-06-29
-- ============================================================
-- BUG: estado_historial.tenant_id es NOT NULL desde migration_multitenant.sql,
-- pero el trigger original (migration.sql línea 129-139) solo inserta
-- (pedido_id, estado) sin tenant_id → cada UPDATE de pedidos.estado
-- viola el constraint NOT NULL y falla con error 500.
-- Esto rompe el módulo de estado de pedidos completo (EstadoSelector,
-- updateEstadoPedido, OrderTimeline) en cualquier tenant multi-tenant.
-- ============================================================

CREATE OR REPLACE FUNCTION registrar_cambio_estado()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO estado_historial (pedido_id, tenant_id, estado)
    VALUES (NEW.id, NEW.tenant_id, NEW.estado);
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- El trigger ya existe (trigger_historial_estado), solo se reemplaza la función.
-- No hace falta recrear el trigger.

-- ─── VERIFICAR ────────────────────────────────────────────────
-- UPDATE pedidos SET estado = estado WHERE id = '<algún id real>';
-- → no debe lanzar error
-- SELECT * FROM estado_historial ORDER BY changed_at DESC LIMIT 5;
-- → debe mostrar tenant_id poblado
