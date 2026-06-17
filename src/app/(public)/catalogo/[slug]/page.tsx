import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { getProductoBySlug } from '@/lib/actions/productos'
import { ProductoDetalle } from '@/components/pdp/ProductoDetalle'
import { formatPrice } from '@/lib/utils/format'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [producto, tenant] = await Promise.all([getProductoBySlug(slug), getTenant()])
  if (!producto) return {}
  const nombre = tenant.nombre || 'Mi Tienda'
  const imagen = producto.imagenes?.[0]
  return {
    title: `${producto.nombre} — ${nombre}`,
    description: producto.descripcion ?? `${producto.nombre} · ${formatPrice(producto.precio)}`,
    alternates: {
      canonical: `/catalogo/${producto.slug}`,
    },
    openGraph: {
      title: producto.nombre,
      description: `${formatPrice(producto.precio)} — ${producto.descripcion ?? producto.nombre}`,
      images: imagen ? [{ url: imagen, width: 800, height: 800, alt: producto.nombre }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: producto.nombre,
      images: imagen ? [imagen] : [],
    },
  }
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params
  const [producto, supabase, tenant] = await Promise.all([
    getProductoBySlug(slug),
    createPublicClient(),
    getTenant(),
  ])
  if (!producto) notFound()

  const { data: config } = await supabase
    .from('config')
    .select('whatsapp_numero, tienda_nombre')
    .eq('tenant_id', tenant.id)
    .single()

  const whatsappNumero = (config?.whatsapp_numero ?? '').replace(/\s/g, '')
  const tiendaNombre = config?.tienda_nombre ?? tenant.nombre

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const agotado = producto.stock !== null && producto.stock === 0

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: producto.nombre,
    description: producto.descripcion ?? producto.nombre,
    image: producto.imagenes ?? [],
    url: `${appUrl}/catalogo/${producto.slug}`,
    brand: { '@type': 'Brand', name: tiendaNombre },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PEN',
      price: (producto.precio / 100).toFixed(2),
      availability: agotado
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: tiendaNombre },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductoDetalle producto={producto} whatsappNumero={whatsappNumero} />
    </>
  )
}
