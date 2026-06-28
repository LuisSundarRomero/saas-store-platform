import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const h = await headers()
  const nombre = h.get('x-tenant-nombre') ?? 'Mi Tienda'
  const slug   = h.get('x-tenant-slug')   ?? ''
  const logo   = h.get('x-tenant-logo')   ?? ''
  const color  = h.get('x-tenant-color')  ?? '#121214'

  const tenantBase = slug ? `/tenants/${slug}` : ''
  const manifest192 = tenantBase ? `${tenantBase}/web-app-manifest-192x192.png` : '/web-app-manifest-192x192.png'
  const manifest512 = tenantBase ? `${tenantBase}/web-app-manifest-512x512.png` : '/web-app-manifest-512x512.png'

  const icons: MetadataRoute.Manifest['icons'] = logo
    ? [
        { src: logo, sizes: 'any', type: 'image/png', purpose: 'any' },
        { src: logo, sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: logo, sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: manifest192, sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: manifest512, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ]
    : [
        { src: manifest192, sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: manifest512, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ]

  return {
    name: nombre,
    short_name: nombre,
    description: `${nombre} — Tienda online`,
    start_url: '/',
    display: 'standalone',
    background_color: '#121214',
    theme_color: color,
    icons,
  }
}
