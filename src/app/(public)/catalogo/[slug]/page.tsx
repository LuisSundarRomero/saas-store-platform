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
    title: `${producto.nombre} — Kuutsu.pe`,
    description: producto.descripcion ?? `${producto.nombre} · ${formatPrice(producto.precio)} · Zapatos coquette exclusivos`,
    openGraph: {
      title: producto.nombre,
      description: `${formatPrice(producto.precio)} — ${producto.descripcion ?? 'Zapatos coquette exclusivos · Kuutsu.pe'}`,
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

  return <ProductoDetalle producto={producto} whatsappNumero={whatsappNumero} />
}
