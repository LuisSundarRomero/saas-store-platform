-- ============================================================
-- RLS Migration: user_metadata → app_metadata
-- Ejecutar en: Supabase → SQL Editor
-- Fecha: 2026-06-29
-- ============================================================
-- MOTIVO: user_metadata es mutable por el cliente (A01 CWE-269).
-- app_metadata solo puede ser escrito por service_role (firmado en JWT).
-- Nota: suscripciones excluida — tabla aún no creada en BD.
-- ============================================================

-- ─── 1. DROP policies que usan user_metadata ────────────────

DROP POLICY IF EXISTS "categorias_admin_all"   ON categorias;
DROP POLICY IF EXISTS "productos_admin_all"     ON productos;
DROP POLICY IF EXISTS "pedidos_admin_all"       ON pedidos;
DROP POLICY IF EXISTS "items_admin_all"         ON pedido_items;
DROP POLICY IF EXISTS "historial_admin_all"     ON estado_historial;
DROP POLICY IF EXISTS "tenants_admin_own"       ON tenants;
DROP POLICY IF EXISTS "config_tienda_auth"      ON config_tienda;
DROP POLICY IF EXISTS "config_anuncio_auth"     ON config_anuncio;
DROP POLICY IF EXISTS "config_banner_auth"      ON config_banner;
DROP POLICY IF EXISTS "config_footer_auth"      ON config_footer;
DROP POLICY IF EXISTS "config_mensajes_auth"    ON config_mensajes;
DROP POLICY IF EXISTS "config_nosotros_auth"    ON config_nosotros;


-- ─── 2. RECREAR con app_metadata ────────────────────────────

CREATE POLICY "categorias_admin_all" ON categorias
  FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

CREATE POLICY "productos_admin_all" ON productos
  FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

CREATE POLICY "pedidos_admin_all" ON pedidos
  FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

CREATE POLICY "items_admin_all" ON pedido_items
  FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

CREATE POLICY "historial_admin_all" ON estado_historial
  FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

CREATE POLICY "tenants_admin_own" ON tenants
  FOR SELECT TO authenticated
  USING (id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

CREATE POLICY "config_tienda_auth" ON config_tienda
  FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

CREATE POLICY "config_anuncio_auth" ON config_anuncio
  FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

CREATE POLICY "config_banner_auth" ON config_banner
  FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

CREATE POLICY "config_footer_auth" ON config_footer
  FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

CREATE POLICY "config_mensajes_auth" ON config_mensajes
  FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

CREATE POLICY "config_nosotros_auth" ON config_nosotros
  FOR ALL TO authenticated
  USING (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));


-- ─── 3. VERIFICAR ────────────────────────────────────────────

-- Sin user_metadata (debe devolver 0 filas):
-- SELECT policyname, tablename
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND (qual::text LIKE '%user_metadata%' OR with_check::text LIKE '%user_metadata%');

-- Con app_metadata (debe devolver 12 filas):
-- SELECT policyname, tablename
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND (qual::text LIKE '%app_metadata%' OR with_check::text LIKE '%app_metadata%');
