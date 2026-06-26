import { Suspense } from 'react'
import { getCategorias, getProductos } from '@/lib/actions/productos'
import { getConfigBanner } from '@/lib/actions/admin'
import { CatalogoGrid } from '@/components/catalogo/CatalogoGrid'
import { CategoryChips } from '@/components/catalogo/CategoryChips'
import { CategorySidebar } from '@/components/catalogo/CategorySidebar'
import { SortSelect } from '@/components/catalogo/SortSelect'
import { SearchBar } from '@/components/catalogo/SearchBar'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const SIDEBAR_THRESHOLD = 9

interface Props {
  searchParams: Promise<{ cat?: string; q?: string; sort?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { cat } = await searchParams
  const { getTenant } = await import('@/lib/tenant')
  const tenant = await getTenant()
  const nombre = tenant.nombre || 'Mi Tienda'
  const ogImages = tenant.logo ? [{ url: tenant.logo, alt: nombre }] : []

  if (cat) {
    const categorias = await getCategorias()
    const categoria = categorias.find((c) => c.slug === cat)

    if (categoria) {
      const title = `${categoria.nombre} — Catálogo`
      const description = `Descubre ${categoria.nombre.toLowerCase()} de la colección de ${nombre}. Envíos a nivel nacional.`
      return {
        title,
        description,
        alternates: { canonical: `/catalogo?cat=${categoria.slug}` },
        openGraph: { title: `${title} — ${nombre}`, description, url: `/catalogo?cat=${categoria.slug}`, type: 'website' },
        twitter: { card: 'summary_large_image', title: `${title} — ${nombre}`, description },
      }
    }
  }

  return {
    title: 'Catálogo',
    description: `Explora toda la colección de ${nombre}. Envíos a nivel nacional.`,
    alternates: { canonical: '/catalogo' },
    openGraph: {
      title: `Catálogo — ${nombre}`,
      description: `Explora toda la colección de ${nombre}. Envíos a nivel nacional.`,
      url: '/catalogo',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Catálogo — ${nombre}`,
      description: `Explora toda la colección de ${nombre}. Envíos a nivel nacional.`,
      images: tenant.logo ? [tenant.logo] : [],
    },
  }
}

export default async function CatalogoPage({ searchParams }: Props) {
  const { cat, q, sort } = await searchParams
  const [categorias, { productos, hasMore }, configBanner] = await Promise.all([
    getCategorias(),
    getProductos({ categoriaSlug: cat, search: q, sort }),
    getConfigBanner(),
  ])

  const categoriaActual = categorias.find((c) => c.slug === cat)
  const useSidebar = (configBanner?.categorias_sidebar ?? false) && categorias.length > SIDEBAR_THRESHOLD

  async function fetchMore(offset: number) {
    'use server'
    return getProductos({ categoriaSlug: cat, search: q, sort, offset })
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* Chips sticky — solo cuando NO hay sidebar */}
      {!useSidebar && (
        <div
          className="sticky top-14 z-10 backdrop-blur border-b border-[var(--color-border)]"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 95%, transparent)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Suspense>
              <CategoryChips categorias={categorias} />
            </Suspense>
          </div>
        </div>
      )}

      {/* En mobile siempre chips, aunque sidebar esté activo */}
      {useSidebar && (
        <div
          className="lg:hidden sticky top-14 z-10 backdrop-blur border-b border-[var(--color-border)]"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 95%, transparent)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <Suspense>
              <CategoryChips categorias={categorias} />
            </Suspense>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Header búsqueda/orden */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-ink)]">
            {q ? `"${q}"` : categoriaActual ? categoriaActual.nombre : 'Todos los productos'}
          </h1>
          <div className="flex items-center gap-2">
            <Suspense><SearchBar /></Suspense>
            <Suspense><SortSelect /></Suspense>
          </div>
        </div>

        {/* Layout: sidebar en desktop si está activado */}
        <div className={useSidebar ? 'flex gap-8 items-start' : ''}>
          {useSidebar && (
            <div className="hidden lg:block sticky top-24 self-start">
              <Suspense>
                <CategorySidebar categorias={categorias} />
              </Suspense>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <CatalogoGrid
              initialProductos={productos}
              initialHasMore={hasMore}
              fetchMore={fetchMore}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
