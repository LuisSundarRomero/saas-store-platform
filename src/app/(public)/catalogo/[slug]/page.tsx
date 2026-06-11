import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getProductoBySlug } from '@/lib/actions/productos'
import { ProductoDetalle } from '@/components/pdp/ProductoDetalle'
import { formatPrice } from '@/lib/utils/format'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const producto = await getProductoBySlug(slug)
  if (!producto) return {}
  const imagen = producto.imagenes?.[0]
  return {
    title: `${producto.nombre} — Anarchyy.pe`,
    description: producto.descripcion ?? `${producto.nombre} · ${formatPrice(producto.precio)} · Ropa streetwear oscura de edición limitada`,
    openGraph: {
      title: producto.nombre,
      description: `${formatPrice(producto.precio)} — ${producto.descripcion ?? 'Ropa streetwear oscura de edición limitada · Anarchyy.pe'}`,
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
  const producto = await getProductoBySlug(slug)
  if (!producto) notFound()

  const supabase = await createClient()
  const { data: config } = await supabase
    .from('config')
    .select('whatsapp_numero')
    .single()

  const whatsappNumero = (config?.whatsapp_numero ?? '').replace(/\s/g, '')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://anarchyy.pe'
  const agotado = producto.stock !== null && producto.stock === 0

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: producto.nombre,
    description: producto.descripcion ?? `${producto.nombre} — Ropa streetwear oscura de edición limitada`,
    image: producto.imagenes ?? [],
    url: `${appUrl}/catalogo/${producto.slug}`,
    brand: { '@type': 'Brand', name: 'Anarchyy' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PEN',
      price: (producto.precio / 100).toFixed(2),
      availability: agotado
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Anarchyy.pe' },
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
