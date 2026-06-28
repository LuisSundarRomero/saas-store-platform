import { headers } from 'next/headers'
import type { MetadataRoute } from 'next'

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN ?? 'contahorro.com'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers()
  const slug = h.get('x-tenant-slug') ?? ''
  const host = slug ? `https://${slug}.${MAIN_DOMAIN}` : `https://${MAIN_DOMAIN}`

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/checkout/', '/api/'],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
  }
}
