import { Suspense } from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'
import { getProductos, getProductosDestacados, getCategorias } from '@/lib/actions/productos'
import { ProductCard } from '@/components/catalogo/ProductCard'
import { CategoryChips } from '@/components/catalogo/CategoryChips'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { WhatsAppButton } from '@/components/home/WhatsAppButton'
import { NosotrosSection } from '@/components/home/NosotrosSection'
import { PlatformLanding } from '@/components/platform/PlatformLanding'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  if (h.get('x-is-platform') === 'true') {
    return {
      title: 'Contahorro — Crea tu tienda online',
      description: 'Plataforma SaaS para tiendas de ropa online en Perú. Recibe pedidos por WhatsApp o tarjeta. Desde S/69/mes.',
    }
  }
  const { getTenant } = await import('@/lib/tenant')
  const tenant = await getTenant()
  const nombre = tenant.nombre || 'Mi Tienda'
  const ogImages = tenant.logo ? [{ url: tenant.logo, alt: nombre }] : []
  return {
    title: nombre,
    description: `Tienda online de ${nombre}. Envíos a nivel nacional.`,
    alternates: { canonical: '/' },
    openGraph: {
      title: nombre,
      description: `Tienda online de ${nombre}. Envíos a nivel nacional.`,
      url: '/',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: nombre,
      description: `Tienda online de ${nombre}. Envíos a nivel nacional.`,
      images: tenant.logo ? [tenant.logo] : [],
    },
  }
}

export default async function HomePage() {
  const h = await headers()
  if (h.get('x-is-platform') === 'true') return <PlatformLanding />

  const { createPublicClient } = await import('@/lib/supabase/server')
  const { getTenant } = await import('@/lib/tenant')
  const [, tenant] = await Promise.all([createPublicClient(), getTenant()])
  const { createAdminClient } = await import('@/lib/supabase/server')
  const admin = createAdminClient()
  const [{ data: cb }, { data: ct }, { data: cn }] = await Promise.all([
    admin.from('config_banner').select('*').eq('tenant_id', tenant.id).single(),
    admin.from('config_tienda').select('whatsapp_numero, tienda_nombre').eq('tenant_id', tenant.id).single(),
    admin.from('config_nosotros').select('*').eq('tenant_id', tenant.id).single(),
  ])

  const heroBadge            = cb?.hero_badge        ?? ''
  const heroTitulo           = cb?.hero_titulo       ?? ''
  const heroSubtitulo        = cb?.hero_subtitulo    ?? ''
  const heroBoton            = cb?.hero_boton        ?? 'Ver colección'
  const heroVisible          = cb?.hero_visible      ?? true
  const heroImagenesVisible  = cb?.imagenes_visible  ?? true
  const stripVisible         = cb?.strip_visible     ?? true
  const stripItems           = [cb?.strip_item1, cb?.strip_item2, cb?.strip_item3, cb?.strip_item4].filter(Boolean) as string[]
  const whatsapp             = ct?.whatsapp_numero   ?? ''

  const [{ productos: novedades }, destacados, categorias] = await Promise.all([
    getProductos({ limit: 12 }),
    getProductosDestacados(),
    getCategorias(),
  ])

  const bannerImagenes: string[] = cb?.imagenes       ?? []
  const bannerLinks:    string[] = cb?.imagenes_links ?? []
  const bannerSlides = bannerImagenes.length > 0
    ? bannerImagenes.map((src, i) => ({ src, href: bannerLinks[i]?.trim() || '/catalogo' }))
    : destacados
        .filter((p) => p.imagenes?.[0])
        .map((p) => ({ src: p.imagenes[0], href: `/catalogo/${p.slug}`, alt: p.nombre }))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const tiendaNombreJson = ct?.tienda_nombre ?? tenant.nombre
  const sameAs = [
    whatsapp ? `https://wa.me/${whatsapp.replace(/\s/g, '')}` : null,
  ].filter(Boolean) as string[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${appUrl}/#organization`,
        name: tiendaNombreJson,
        url: appUrl,
        logo: `${appUrl}/favicon-96x96.png`,
        ...(sameAs.length > 0 && { sameAs }),
      },
      {
        '@type': 'WebSite',
        '@id': `${appUrl}/#website`,
        url: appUrl,
        name: tiendaNombreJson,
        publisher: { '@id': `${appUrl}/#organization` },
      },
    ],
  }

  return (
    <main className="min-h-dvh" style={{ backgroundColor: 'var(--color-bg)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* H1 siempre presente para SEO — visualmente oculto si heroVisible muestra el decorativo */}
      {!heroVisible && (
        <h1 className="sr-only">{heroTitulo || tiendaNombreJson}</h1>
      )}

      {/* ── HERO ── */}
      {heroVisible && (
        <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-1 gap-6 lg:gap-8 items-center py-6 sm:py-8 lg:py-10 ${tenant.slug === 'kuttsu' || tenant.slug === 'toscanoleather' ? 'lg:grid-cols-[0.85fr_1.35fr]' : 'lg:grid-cols-[0.65fr_1.35fr]'}`}>

              {/* ── Texto ── */}
              <div className="order-2 lg:order-1 lg:pr-4 flex flex-col items-center text-center lg:items-start lg:text-left">
                {/* Badge */}
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase mb-4"
                  style={{ backgroundColor: 'var(--color-brand-bg)', color: 'var(--color-brand-text)' }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: 'var(--color-brand)' }} />
                  {heroBadge}
                </span>

                {/* Título */}
                <h1 className="font-display leading-[1.05] mb-4"
                  style={{ fontSize: 'clamp(2.2rem, 9vw, 4.5rem)' }}>
                  {heroTitulo.split(' ').map((word: string, i: number, arr: string[]) => (
                    <span key={i}>
                      <span style={{
                        color: i >= Math.floor(arr.length / 2) ? 'var(--color-brand)' : 'var(--color-ink)',
                      }}>
                        {word}
                      </span>
                      {i < arr.length - 1 && ' '}
                    </span>
                  ))}
                </h1>

                {/* Subtítulo */}
                <p className="text-sm leading-relaxed mb-5 max-w-xs lg:max-w-none" style={{ color: 'var(--color-muted)' }}>{heroSubtitulo}</p>

                {/* CTAs */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-4 lg:mb-8">
                  <Link href="/catalogo"
                    className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-full text-sm transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-brand)', boxShadow: '0 4px 20px var(--color-brand-glow)' }}>
                    {heroBoton}
                  </Link>
                  {whatsapp && <WhatsAppButton numero={whatsapp} />}
                </div>

              </div>

              {/* ── Slider de imágenes del banner ── */}
              {heroImagenesVisible && bannerSlides.length > 0 && (
                <div className="order-1 lg:order-2">
                  <HeroCarousel
                    slides={bannerSlides}
                    slideBg={tenant.slug === 'kuttsu' ? 'var(--color-surface-alt)' : undefined}
                  />
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ── STRIP ── */}
      {heroVisible && stripVisible && stripItems.length > 0 && (
        <section className="border-y py-3.5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-6 sm:gap-12 flex-wrap text-xs sm:text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
              {stripItems.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">{item}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── CATEGORÃAS ── */}
        {categorias.length > 0 && (
          <section className="pt-10">
            <div className="mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-ink)' }}>Recién llegado</h2>
            </div>

            <Suspense>
              <CategoryChips categorias={categorias} />
            </Suspense>
          </section>
        )}

        {/* ── ÚLTIMAS LLEGADAS ── */}
        {novedades.length > 0 && (
          <section className="pb-10 pt-6">


            {/* Grid proporcional — pensado para pocos productos */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
              {novedades.slice(0, 8).map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>

            {/* Ver todo — debajo de la sección */}
            <div className="mt-8 flex justify-center">
              <Link href="/catalogo"
                className="ver-coleccion inline-flex items-center gap-2 text-sm font-semibold px-7 py-3 rounded-full border-2 transition-all">
                Ver toda la colección →
              </Link>
            </div>
          </section>
        )}

      </div>

      {/* ── NOSOTROS ── */}
      {cn?.visible && (
        <NosotrosSection config={cn} />
      )}
    </main>
  )
}

