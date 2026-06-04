'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Categoria } from '@/types'
import { pushEvent } from '@/lib/utils/gtm'

interface CategoryChipsProps {
  categorias: Categoria[]
}

export function CategoryChips({ categorias }: CategoryChipsProps) {
  const searchParams = useSearchParams()
  const categoriaActual = searchParams.get('cat')

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      <Link
        href="/catalogo"
        className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
        style={
          !categoriaActual
            ? { backgroundColor: '#1A1A1A', color: '#fff', borderColor: '#1A1A1A' }
            : { backgroundColor: '#fff', color: '#6B6B6B', borderColor: '#E5E5E3' }
        }
      >
        Todo
      </Link>

      {categorias.map((cat) => (
        <Link
          key={cat.id}
          href={`/catalogo?cat=${cat.slug}`}
          onClick={() => pushEvent('category_click', { category_name: cat.nombre, category_slug: cat.slug })}
          className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
          style={
            categoriaActual === cat.slug
              ? { backgroundColor: '#1A1A1A', color: '#fff', borderColor: '#1A1A1A' }
              : { backgroundColor: '#fff', color: '#6B6B6B', borderColor: '#E5E5E3' }
          }
        >
          {cat.nombre}
        </Link>
      ))}
    </div>
  )
}
