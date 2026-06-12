import Link from 'next/link'
import { IconBrandWhatsapp } from '@tabler/icons-react'
import { getProductos, getProductosDestacados } from '@/lib/actions/productos'
import { ProductCard } from '@/components/catalogo/ProductCard'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Anarchyy.pe — Lujo oscuro / Dark Streetwear',
  description: 'Ropa streetwear oscura de edición limitada: hoodies, cargos y poleras. Hago lo que quiero vestir. Envíos a nivel nacional · Pide por WhatsApp.',
  openGraph: {
    title: 'Anarchyy.pe — Lujo oscuro / Dark Streetwear',
    description: 'Ropa streetwear oscura de edición limitada: hoodies, cargos y poleras.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anarchyy.pe — Lujo oscuro / Dark Streetwear',
    description: 'Ropa streetwear oscura de edición limitada: hoodies, cargos y poleras.',
  },
}

export default async function HomePage() {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: config } = await supabase.from('config').select('*').single()

  const heroBadge     = config?.hero_badge      ?? '🦇 Restock en preventa'
  const heroTitulo    = config?.hero_titulo     ?? 'Hago lo que quiero vestir'
  const heroSubtitulo = config?.hero_subtitulo  ?? 'Lujo oscuro. Essence of Dark Fashion. Piezas streetwear de edición limitada.'
  const heroBoton     = config?.hero_boton      ?? 'Ver colección'
  const heroVisible          = config?.hero_visible           ?? true
  const heroImagenesVisible  = config?.hero_imagenes_visible  ?? true
  const stripVisible  = config?.strip_visible   ?? true
  const stripItems    = [
    config?.strip_item1 ?? '🖤 Diseños únicos y originales',
    config?.strip_item2 ?? '🦇 Colección dark exclusiva',
    config?.strip_item3 ?? '💬 Atención personalizada',
    config?.strip_item4 ?? '🚚 Envíos a nivel nacional',
  ].filter(Boolean)
  const whatsapp = config?.whatsapp_numero ?? ''

  const [novedades, destacados] = await Promise.all([
    getProductos({ limit: 12 }),
    getProductosDestacados(),
  ])

  const bannerImagenes: string[] = config?.banner_imagenes ?? []
  const bannerLinks: string[] = config?.banner_links ?? []
  const bannerSlides = bannerImagenes.length > 0
    ? bannerImagenes.map((src, i) => ({ src, href: bannerLinks[i]?.trim() || '/catalogo' }))
    : destacados
        .filter((p) => p.imagenes?.[0])
        .map((p) => ({ src: p.imagenes[0], href: `/catalogo/${p.slug}`, alt: p.nombre }))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://anarchyy.pe'
  const sameAs = [
    config?.redes_instagram,
    config?.redes_tiktok,
    whatsapp ? `https://wa.me/${whatsapp.replace(/\s/g, '')}` : null,
  ].filter(Boolean) as string[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${appUrl}/#organization`,
        name: config?.tienda_nombre ?? 'Anarchyy.pe',
        url: appUrl,
        logo: `${appUrl}/favicon-96x96.png`,
        ...(sameAs.length > 0 && { sameAs }),
      },
      {
        '@type': 'WebSite',
        '@id': `${appUrl}/#website`,
        url: appUrl,
        name: config?.tienda_nombre ?? 'Anarchyy.pe',
        publisher: { '@id': `${appUrl}/#organization` },
      },
    ],
  }

  return (
    <main className="min-h-screen bg-[#1F1F22]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── */}
      {heroVisible && (
        <section className="relative overflow-hidden bg-[#121214]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[0.65fr_1.35fr] gap-6 lg:gap-8 items-center py-6 sm:py-8 lg:py-10">

              {/* ── Texto ── */}
              <div className="order-2 lg:order-1 lg:pr-4 flex flex-col items-center text-center lg:items-start lg:text-left">
                {/* Badge */}
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase mb-4"
                  style={{ backgroundColor: '#3A1014', color: '#FF6B7A' }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: '#E11D2E' }} />
                  {heroBadge}
                </span>

                {/* Título */}
                <h1 className="font-display leading-[1.05] mb-4"
                  style={{ fontSize: 'clamp(2.2rem, 9vw, 4.5rem)' }}>
                  {heroTitulo.split(' ').map((word: string, i: number, arr: string[]) => (
                    <span key={i}>
                      <span style={{
                        color: i >= Math.floor(arr.length / 2) ? '#E11D2E' : '#F5F5F2',
                      }}>
                        {word}
                      </span>
                      {i < arr.length - 1 && ' '}
                    </span>
                  ))}
                </h1>

                {/* Subtítulo */}
                <p className="text-[#9A9A9E] text-sm leading-relaxed mb-5 max-w-xs lg:max-w-none">{heroSubtitulo}</p>

                {/* CTAs */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-4 lg:mb-8">
                  <Link href="/catalogo"
                    className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-full text-sm transition-all hover:opacity-90"
                    style={{ backgroundColor: '#E11D2E', boxShadow: '0 4px 20px rgba(225,29,46,0.35)' }}>
                    {heroBoton}
                  </Link>
                  {whatsapp && (
                    <a href={`https://wa.me/${whatsapp.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-medium px-6 py-3 rounded-full text-sm border text-[#9A9A9E] hover:border-[#E11D2E] hover:text-[#F5F5F2] transition-colors"
                      style={{ borderColor: '#2C2C30' }}>
                      <IconBrandWhatsapp size={16} /> Escríbenos
                    </a>
                  )}
                </div>

              </div>

              {/* ── Slider de imágenes del banner ── */}
              {heroImagenesVisible && bannerSlides.length > 0 && (
                <div className="order-1 lg:order-2">
                  <HeroCarousel slides={bannerSlides} />
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ── STRIP ── */}
      {heroVisible && stripVisible && stripItems.length > 0 && (
        <section className="border-y border-[#2C2C30] py-3.5" style={{ backgroundColor: '#161618' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-6 sm:gap-12 flex-wrap text-xs sm:text-sm text-[#9A9A9E] font-medium">
              {stripItems.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">{item}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── ÚLTIMAS LLEGADAS ── */}
        {novedades.length > 0 && (
          <section className="py-16">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-[#F5F5F2]">Recién llegado</h2>
            </div>

            {/* Grid proporcional — pensado para pocos productos */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
              {novedades.slice(0, 8).map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>

            {/* Ver todo — debajo de la sección */}
            <div className="mt-8 flex justify-center">
              <Link href="/catalogo"
                className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3 rounded-full border-2 transition-all hover:border-[#E11D2E] hover:text-[#F5F5F2]"
                style={{ borderColor: '#2C2C30', color: '#9A9A9E' }}>
                Ver toda la colección →
              </Link>
            </div>
          </section>
        )}

      </div>
    </main>
  )
}
