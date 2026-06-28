'use client'

import { useState, useTransition } from 'react'
import { ProductCard } from './ProductCard'
import type { Producto } from '@/types'

interface Props {
  initialProductos: Producto[]
  initialHasMore: boolean
  fetchMore: (offset: number) => Promise<{ productos: Producto[]; hasMore: boolean }>
}

export function CatalogoGrid({ initialProductos, initialHasMore, fetchMore }: Props) {
  const [productos, setProductos] = useState(initialProductos)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isPending, startTransition] = useTransition()

  function handleLoadMore() {
    startTransition(async () => {
      const result = await fetchMore(productos.length)
      setProductos((prev) => [...prev, ...result.productos])
      setHasMore(result.hasMore)
    })
  }

  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-3xl">🔍</div>
        <div>
          <p className="font-semibold text-[var(--color-ink)]">Sin productos</p>
          <p className="text-sm text-[var(--color-muted)] mt-1">Prueba con otra categoría o búsqueda</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {productos.map((p, i) => (
          <ProductCard key={p.id} producto={p} priority={i < 4} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="px-8 py-3 rounded-full text-sm font-semibold border transition-all disabled:opacity-50"
            style={{
              borderColor: 'var(--color-brand)',
              color: 'var(--color-brand)',
              backgroundColor: isPending ? 'var(--color-brand-bg)' : 'transparent',
            }}
          >
            {isPending ? 'Cargando...' : 'Ver más productos'}
          </button>
        </div>
      )}
    </div>
  )
}
