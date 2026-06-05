import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kuutsu.pe'

  const supabase = await createClient()
  const { data: productos } = await supabase
    .from('productos')
    .select('slug, updated_at')
    .eq('visible', true)

  const { data: categorias } = await supabase
    .from('categorias')
    .select('slug, updated_at')
    .eq('activa', true)

  const productoUrls: MetadataRoute.Sitemap = (productos ?? []).map((p) => ({
    url: `${base}/catalogo/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoriaUrls: MetadataRoute.Sitemap = (categorias ?? []).map((c) => ({
    url: `${base}/catalogo?cat=${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${base}/catalogo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productoUrls,
    ...categoriaUrls,
  ]
}
