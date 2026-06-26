'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Categoria } from '@/types'
import { pushEvent } from '@/lib/utils/gtm'

interface Props {
  categorias: Categoria[]
}

export function CategorySidebar({ categorias }: Props) {
  const searchParams = useSearchParams()
  const categoriaActual = searchParams.get('cat')

  return (
    <aside className="hidden lg:flex flex-col gap-1 w-44 shrink-0">
      <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--color-muted)' }}>
        Categorías
      </p>

      <Link
        href="/catalogo"
        className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
        style={
          !categoriaActual
            ? { backgroundColor: 'var(--color-brand)', color: '#fff' }
            : { color: 'var(--color-ink)', backgroundColor: 'transparent' }
        }
      >
        Todos
      </Link>

      {categorias.map((cat) => (
        <Link
          key={cat.id}
          href={`/catalogo?cat=${cat.slug}`}
          onClick={() => pushEvent('category_click', { category_name: cat.nombre, category_slug: cat.slug })}
          className="px-3 py-2 rounded-xl text-sm font-medium transition-all hover:bg-[var(--color-surface)]"
          style={
            categoriaActual === cat.slug
              ? { backgroundColor: 'var(--color-brand)', color: '#fff' }
              : { color: 'var(--color-ink)' }
          }
        >
          {cat.nombre}
        </Link>
      ))}
    </aside>
  )
}
