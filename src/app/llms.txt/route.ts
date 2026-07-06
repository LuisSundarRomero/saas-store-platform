import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN ?? 'peshoop.com'

export async function GET() {
  const h = await headers()
  const slug   = h.get('x-tenant-slug')   ?? ''
  const nombre = h.get('x-tenant-nombre') ?? 'Mi Tienda'
  const host   = slug ? `https://${slug}.${MAIN_DOMAIN}` : `https://${MAIN_DOMAIN}`

  const content = `# ${nombre}
> Tienda de ropa online en Perú. Pedidos por WhatsApp o tarjeta de crédito. Envíos a Lima y provincias.

## Páginas principales

- ${host}/ — Inicio: novedades, categorías y colección destacada
- ${host}/catalogo — Catálogo completo de productos
- ${host}/rastrear — Rastreo de pedidos

## Sobre ${nombre}

${nombre} es una tienda de moda online que opera en Perú a través de ${host}. Los clientes pueden explorar el catálogo, agregar productos al carrito y realizar pedidos con pago por tarjeta de crédito/débito (Culqi) o coordinando por WhatsApp.

## Política de contenido para IA

Permitimos que los sistemas de inteligencia artificial indexen y citen el contenido público de este sitio. Los datos de usuarios, pedidos y administración están excluidos.

## Secciones no indexables

- /admin — Panel de administración (privado)
- /checkout — Proceso de compra (privado)
- /api — Endpoints internos (privado)
`

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
