import Link from 'next/link'
import { IconBrandWhatsapp } from '@tabler/icons-react'
import { getCategorias, getProductos, getProductosDestacados } from '@/lib/actions/productos'
import { ProductCard } from '@/components/catalogo/ProductCard'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Kuutsu.pe — Zapatos coquette exclusivos',
  description: 'Zapatos coquette exclusivos en Lima. Bota peluche, Mary Jane, doble capa y más. Envíos a todo Lima · Pide por WhatsApp.',
  openGraph: {
    title: 'Kuutsu.pe — Zapatos coquette exclusivos',
    description: 'Zapatos coquette exclusivos en Lima. Bota peluche, Mary Jane, doble capa y más.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kuutsu.pe — Zapatos coquette exclusivos',
    description: 'Zapatos coquette exclusivos en Lima. Bota peluche, Mary Jane, doble capa y más.',
  },
}

export default async function HomePage() {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: config } = await supabase.from('config').select('*').single()

  const heroBadge     = config?.hero_badge      ?? '🎀 Nueva colección disponible'
  const heroTitulo    = config?.hero_titulo     ?? 'Zapatos que te hacen brillar'
  const heroSubtitulo = config?.hero_subtitulo  ?? 'Modelos coquette únicos y originales. Porque cada detalle importa cuando se trata de ti.'
  const heroBoton     = config?.hero_boton      ?? 'Ver colección'
  const ctaTitulo     = config?.cta_titulo      ?? '¿Tienes alguna consulta?'
  const ctaSubtitulo  = config?.cta_subtitulo   ?? 'Te asesoramos personalmente para encontrar el modelo perfecto.'
  const heroVisible          = config?.hero_visible           ?? true
  const heroImagenesVisible  = config?.hero_imagenes_visible  ?? true
  const ctaVisible    = config?.cta_visible     ?? true
  const stripVisible  = config?.strip_visible   ?? true
  const stripItems    = [
    config?.strip_item1 ?? '🎀 Diseños únicos y originales',
    config?.strip_item2 ?? '✨ Colección coquette exclusiva',
    config?.strip_item3 ?? '💬 Atención personalizada',
    config?.strip_item4 ?? '🚚 Envíos a todo Lima',
  ].filter(Boolean)
  const whatsapp = config?.whatsapp_numero ?? ''

  const [categorias, novedades, destacados] = await Promise.all([
    getCategorias(),
    getProductos({ limit: 12 }),
    getProductosDestacados(),
  ])

  const bannerProductos = destacados

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      {heroVisible && (
        <section className="relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[0.65fr_1.35fr] gap-6 lg:gap-8 items-center py-6 sm:py-8 lg:py-10">

              {/* ── Texto ── */}
              <div className="order-2 lg:order-1 lg:pr-4 flex flex-col items-center text-center lg:items-start lg:text-left">
                {/* Badge */}
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase mb-4"
                  style={{ backgroundColor: '#FCE7F3', color: '#BE185D' }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: '#EC4899' }} />
                  {heroBadge}
                </span>

                {/* Título */}
                <h1 className="font-serif leading-[1.08] mb-4"
                  style={{ fontSize: 'clamp(2rem, 8vw, 3.8rem)', letterSpacing: '0.01em' }}>
                  {heroTitulo.split(' ').map((word: string, i: number, arr: string[]) => (
                    <span key={i}>
                      <span style={{
                        color: i >= Math.floor(arr.length / 2) ? '#EC4899' : '#1A1A1A',
                        fontWeight: i >= Math.floor(arr.length / 2) ? 600 : 300,
                        fontStyle: 'italic',
                      }}>
                        {word}
                      </span>
                      {i < arr.length - 1 && ' '}
                    </span>
                  ))}
                </h1>

                {/* Subtítulo */}
                <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-xs lg:max-w-none">{heroSubtitulo}</p>

                {/* CTAs */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-4 lg:mb-8">
                  <Link href="/catalogo"
                    className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-full text-sm transition-all hover:opacity-90"
                    style={{ backgroundColor: '#EC4899', boxShadow: '0 4px 20px rgba(236,72,153,0.3)' }}>
                    {heroBoton}
                  </Link>
                  {whatsapp && (
                    <a href={`https://wa.me/${whatsapp.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-medium px-6 py-3 rounded-full text-sm border text-gray-500 hover:border-pink-300 hover:text-pink-500 transition-colors"
                      style={{ borderColor: '#E5E7EB' }}>
                      <IconBrandWhatsapp size={16} /> Escríbenos
                    </a>
                  )}
                </div>

              </div>

              {/* ── Productos — solo desktop ── */}
              {heroImagenesVisible && bannerProductos.length > 0 && (
                <div className="order-1 lg:order-2 hidden lg:block">
                  <div className="gap-2.5" style={{ height: 'min(640px, 75vh)', display: 'grid', gridTemplateColumns: bannerProductos.length === 1 ? '1fr' : '1fr 1.6fr', gridTemplateRows: bannerProductos.length === 1 ? 'minmax(0,1fr)' : 'minmax(0,1fr) minmax(0,1fr)' }}>

                    {/* 1 producto: ocupa todo */}
                    {bannerProductos.length === 1 && bannerProductos[0] && (
                      <Link href={`/catalogo/${bannerProductos[0].slug}`}
                        className="group relative rounded-2xl overflow-hidden bg-gray-100">
                        {bannerProductos[0].imagenes?.[0]
                          ? <img src={bannerProductos[0].imagenes[0]} alt={bannerProductos[0].nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <div className="w-full h-full flex items-center justify-center text-4xl">👟</div>}
                      </Link>
                    )}

                    {/* 2 productos: dos columnas iguales */}
                    {bannerProductos.length === 2 && bannerProductos.map((p) => (
                      <Link key={p.id} href={`/catalogo/${p.slug}`}
                        className="group relative rounded-2xl overflow-hidden bg-gray-100"
                        style={{ gridRow: '1 / 3', minHeight: 0 }}>
                        {p.imagenes?.[0]
                          ? <img src={p.imagenes[0]} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <div className="w-full h-full flex items-center justify-center text-4xl">👟</div>}
                      </Link>
                    ))}

                    {/* 3-4 productos: grande izquierda + derecha en columna */}
                    {bannerProductos.length >= 3 && (
                      <>
                        {/* Grande izquierda — span 2 rows */}
                        <Link href={`/catalogo/${bannerProductos[0].slug}`}
                          className="group relative rounded-2xl overflow-hidden bg-gray-100"
                          style={{ gridRow: '1 / 3', minHeight: 0 }}>
                          {bannerProductos[0].imagenes?.[0]
                            ? <img src={bannerProductos[0].imagenes[0]} alt={bannerProductos[0].nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            : <div className="w-full h-full flex items-center justify-center text-4xl">👟</div>}
                        </Link>

                        {/* Superior derecha */}
                        <Link href={`/catalogo/${bannerProductos[1].slug}`}
                          className="group relative rounded-2xl overflow-hidden bg-gray-100"
                          style={{ minHeight: 0 }}>
                          {bannerProductos[1].imagenes?.[0]
                            ? <img src={bannerProductos[1].imagenes[0]} alt={bannerProductos[1].nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{ objectPosition: 'center 65%' }} />
                            : <div className="w-full h-full flex items-center justify-center text-4xl">👟</div>}
                        </Link>

                        {/* Inferior derecha: 1 o 2 pequeños */}
                        <div className="grid gap-2.5" style={{ gridTemplateColumns: bannerProductos.length === 4 ? '1fr 1fr' : '1fr', minHeight: 0 }}>
                          {bannerProductos.slice(2, 4).map((p) => (
                            <Link key={p.id} href={`/catalogo/${p.slug}`}
                              className="group relative rounded-2xl overflow-hidden bg-gray-100">
                              {p.imagenes?.[0]
                                ? <img src={p.imagenes[0]} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                : <div className="w-full h-full flex items-center justify-center text-2xl">👟</div>}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          ))}
                        </div>
                      </>
                    )}

                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ── STRIP ── */}
      {heroVisible && stripVisible && stripItems.length > 0 && (
        <section className="border-y border-gray-100 py-3.5" style={{ backgroundColor: '#FAFAFA' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-6 sm:gap-12 flex-wrap text-xs sm:text-sm text-gray-500 font-medium">
              {stripItems.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">{item}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── CATEGORÍAS ── */}
        {categorias.length > 0 && (
          <section className="py-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Explorar por categoría</h2>
              <Link href="/catalogo" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
                Ver todo →
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {categorias.map((cat, i) => {
                const bgs   = ['#FCE7F3','#FEF3C7','#DBEAFE','#D1FAE5','#EDE9FE','#FEE2E2']
                const texts = ['#BE185D','#92400E','#1D4ED8','#065F46','#5B21B6','#991B1B']
                return (
                  <Link key={cat.id} href={`/catalogo?cat=${cat.slug}`}
                    className="shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 hover:shadow-sm"
                    style={{ backgroundColor: bgs[i % bgs.length], color: texts[i % texts.length] }}>
                    {cat.nombre}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── ÚLTIMAS LLEGADAS ── */}
        {novedades.length > 0 && (
          <section className="pb-16">


            {/* Grid uniforme — máx 6, proporcional */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-6">
              {novedades.slice(0, 6).map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>

            {/* Ver todo — debajo de la sección */}
            <div className="mt-8 flex justify-center">
              <Link href="/catalogo"
                className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3 rounded-full border-2 transition-all hover:border-pink-300 hover:text-pink-500"
                style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>
                Ver toda la colección →
              </Link>
            </div>
          </section>
        )}

        {/* ── CTA FINAL ── */}
        {ctaVisible && (
          <section className="mb-16 rounded-3xl overflow-hidden border border-pink-100"
            style={{ background: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 50%, #FFF0F7 100%)' }}>
            <div className="px-8 sm:px-12 lg:px-16 py-12 sm:py-16 flex flex-col sm:flex-row items-center gap-8">
              <div className="flex-1 text-center sm:text-left">
                <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(236,72,153,0.1)', color: '#BE185D' }}>
                  🎀 Atención personalizada
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3"
                  style={{ color: '#1A1A1A' }}>
                  {ctaTitulo}
                </h3>
                <p className="text-gray-500 text-sm sm:text-base max-w-sm">
                  {ctaSubtitulo}
                </p>
              </div>
              {whatsapp && (
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <a href={`https://wa.me/${whatsapp.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 font-semibold px-7 py-3.5 rounded-full text-sm text-white transition-all hover:opacity-90 hover:shadow-lg"
                    style={{ backgroundColor: '#25D366', boxShadow: '0 4px 20px rgba(37,211,102,0.25)' }}>
                    💬 Hablar por WhatsApp
                  </a>
                  <p className="text-xs text-gray-400">Respuesta rápida garantizada</p>
                </div>
              )}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}
