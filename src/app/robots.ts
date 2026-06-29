import { headers } from 'next/headers'
import type { MetadataRoute } from 'next'

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN ?? 'contahorro.com'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers()
  const slug = h.get('x-tenant-slug') ?? ''
  const host = slug ? `https://${slug}.${MAIN_DOMAIN}` : `https://${MAIN_DOMAIN}`

  const disallow = ['/admin/', '/checkout/', '/api/']

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      // Explicitly allow AI crawlers for Generative Engine Optimization (GEO)
      { userAgent: 'GPTBot', allow: '/', disallow },
      { userAgent: 'ChatGPT-User', allow: '/', disallow },
      { userAgent: 'PerplexityBot', allow: '/', disallow },
      { userAgent: 'ClaudeBot', allow: '/', disallow },
      { userAgent: 'Claude-Web', allow: '/', disallow },
      { userAgent: 'Google-Extended', allow: '/', disallow },
      { userAgent: 'Amazonbot', allow: '/', disallow },
      { userAgent: 'Applebot-Extended', allow: '/', disallow },
    ],
    sitemap: `${host}/sitemap.xml`,
  }
}
