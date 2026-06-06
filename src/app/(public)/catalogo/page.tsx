import { Suspense } from 'react'
import { getCategorias, getProductos } from '@/lib/actions/productos'
import { ProductCard } from '@/components/catalogo/ProductCard'
import { CategoryChips } from '@/components/catalogo/CategoryChips'
import { SortSelect } from '@/components/catalogo/SortSelect'
import { SearchBar } from '@/components/catalogo/SearchBar'
import type { Metadata } from 'next'

export const revalidate = 30

export const metadata: Metadata = {
  title: 'Catálogo de zapatos',
  description: 'Explora toda la colección de zapatos coquette: bota peluche, Mary Jane, doble capa y más. Envíos a todo Lima.',
  openGraph: {
    title: 'Catálogo — Kuutsu.pe',
    description: 'Explora toda la colección de zapatos coquette. Envíos a todo Lima.',
    url: '/catalogo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catálogo — Kuutsu.pe',
    description: 'Explora toda la colección de zapatos coquette. Envíos a todo Lima.',
  },
}

interface Props {
  searchParams: Promise<{ cat?: string; q?: string; sort?: string }>
}

export default async function CatalogoPage({ searchParams }: Props) {
  const { cat, q, sort } = await searchParams
  const [categorias, productos] = await Promise.all([
    getCategorias(),
    getProductos({ categoriaSlug: cat, search: q, sort }),
  ])

  const categoriaActual = categorias.find((c) => c.slug === cat)

  return (
    <main className="min-h-screen bg-white">
      {/* Chips sticky */}
      <div className="sticky top-14 z-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Suspense>
            <CategoryChips categorias={categorias} />
          </Suspense>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {q ? `"${q}"` : categoriaActual ? categoriaActual.nombre : 'Todos los productos'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Suspense>
              <SearchBar />
            </Suspense>
            <Suspense>
              <SortSelect />
            </Suspense>
          </div>
        </div>

        {productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">🔍</div>
            <div>
              <p className="font-semibold text-gray-700">Sin productos</p>
              <p className="text-sm text-gray-400 mt-1">Prueba con otra categoría o búsqueda</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {productos.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
