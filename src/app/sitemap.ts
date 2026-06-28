import { headers } from 'next/headers'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import type { MetadataRoute } from 'next'

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN ?? 'contahorro.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers()
  const slug     = h.get('x-tenant-slug') ?? ''
  const tenantId = h.get('x-tenant-id')   ?? ''
  const host     = slug ? `https://${slug}.${MAIN_DOMAIN}` : `https://${MAIN_DOMAIN}`

  const staticPages: MetadataRoute.Sitemap = [
    { url: host,                             lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${host}/catalogo`,               lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${host}/politica-de-privacidad`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${host}/terminos-y-condiciones`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  if (!tenantId) return staticPages

  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: productos }, { data: categorias }] = await Promise.all([
    admin.from('productos').select('slug, updated_at').eq('tenant_id', tenantId).eq('visible', true),
    admin.from('categorias').select('slug, updated_at').eq('tenant_id', tenantId).eq('activa', true),
  ])

  const productoUrls: MetadataRoute.Sitemap = (productos ?? []).map((p) => ({
    url: `${host}/catalogo/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoriaUrls: MetadataRoute.Sitemap = (categorias ?? []).map((c) => ({
    url: `${host}/catalogo?cat=${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticPages, ...productoUrls, ...categoriaUrls]
}
