-- Función atómica para descontar stock de un producto.
-- Reemplaza el patrón read-modify-write (SELECT luego UPDATE) que tiene race condition.
--
-- Cómo ejecutar: pegar este contenido en Supabase SQL Editor y ejecutar.
--
-- La operación es atómica: PostgreSQL bloquea la fila con FOR UPDATE implícito
-- durante el UPDATE, garantizando que dos checkouts simultáneos no puedan
-- leer el mismo valor de stock y producir un oversell.

CREATE OR REPLACE FUNCTION descontar_stock(
  p_producto_id uuid,
  p_tenant_id   uuid,
  p_cantidad    integer
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE productos
  SET
    stock   = GREATEST(0, stock - p_cantidad),
    -- Ambas referencias a `stock` usan el valor ANTERIOR al UPDATE (comportamiento
    -- estándar de PostgreSQL en el SET clause), por lo que el cálculo es correcto.
    visible = GREATEST(0, stock - p_cantidad) > 0
  WHERE id        = p_producto_id
    AND tenant_id = p_tenant_id
    AND stock IS NOT NULL;
$$;

-- Revocar ejecución pública; solo service role puede llamarla vía RPC.
REVOKE EXECUTE ON FUNCTION descontar_stock(uuid, uuid, integer) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION descontar_stock(uuid, uuid, integer) TO service_role;
