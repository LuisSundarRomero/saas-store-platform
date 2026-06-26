-- ============================================================
-- Migración: Tema "warm" + tenant Toscano Leather
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

-- 1. Asegurar que la columna theme existe en tenants
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';

-- 2. Crear (o actualizar si ya existe) el tenant Toscano Leather
INSERT INTO tenants (
  slug,
  nombre,
  color_primario,
  theme,
  font_display,
  font_body,
  activo,
  etapa
) VALUES (
  'toscanoleather',
  'Toscano Leather',
  '#655144',     -- leather brown — usado como --color-brand (botones, CTAs)
  'warm',        -- activa [data-theme="warm"] en globals.css
  'Playfair Display',  -- serif elegante para títulos
  'Lato',              -- body limpio y profesional
  true,
  'produccion'
)
ON CONFLICT (slug) DO UPDATE SET
  color_primario = EXCLUDED.color_primario,
  theme          = EXCLUDED.theme,
  font_display   = EXCLUDED.font_display,
  font_body      = EXCLUDED.font_body;

-- 3. Asignar plan si la tabla suscripciones existe (opcional)
-- Si no tienes la tabla suscripciones, omite este bloque.
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'suscripciones') THEN
    INSERT INTO suscripciones (tenant_id, plan_id, estado)
    SELECT t.id, p.id, 'activo'
    FROM tenants t, planes p
    WHERE t.slug = 'toscanoleather' AND p.nombre = 'pro'
    ON CONFLICT DO NOTHING;

    UPDATE tenants
    SET plan_id = (SELECT id FROM planes WHERE nombre = 'pro')
    WHERE slug = 'toscanoleather' AND plan_id IS NULL;
  END IF;
END $$;

-- Verificar:
-- SELECT slug, nombre, color_primario, theme, font_display, font_body, etapa FROM tenants WHERE slug = 'toscanoleather';
