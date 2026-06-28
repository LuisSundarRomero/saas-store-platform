'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Categoria } from '@/types'
import { pushEvent } from '@/lib/utils/gtm'

interface CategoryChipsProps {
  categorias: Categoria[]
}

const SCROLL_STEP = 200

export function CategoryChips({ categorias }: CategoryChipsProps) {
  const searchParams = useSearchParams()
  const categoriaActual = searchParams.get('cat')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function check() {
      if (!el) return
      setShowLeft(el.scrollLeft > 4)
      setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
    }

    const rafId = requestAnimationFrame(check)
    el.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)

    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener('scroll', check)
      ro.disconnect()
    }
  }, [categorias])

  const scrollLeft = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' })
  }, [])

  const scrollRight = useCallback(() => {
    scrollRef.current?.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' })
  }, [])

  return (
    <div className="relative group/chips">
      {/* Flecha izquierda — solo desktop */}
      {showLeft && (
        <button
          type="button"
          onClick={scrollLeft}
          aria-label="Ver categorías anteriores"
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-20 w-7 h-7 items-center justify-center rounded-full shadow-md border transition-opacity opacity-0 group-hover/chips:opacity-100"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-ink)' }}
        >
          <IconChevronLeft size={14} />
        </button>
      )}

      {/* Flecha derecha — solo desktop */}
      {showRight && (
        <button
          type="button"
          onClick={scrollRight}
          aria-label="Ver más categorías"
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-20 w-7 h-7 items-center justify-center rounded-full shadow-md border transition-opacity opacity-0 group-hover/chips:opacity-100"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-ink)' }}
        >
          <IconChevronRight size={14} />
        </button>
      )}

      {/* Degradado izquierdo */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-10 z-10 transition-opacity duration-200"
        style={{
          opacity: showLeft ? 1 : 0,
          background: 'linear-gradient(to right, var(--color-bg) 30%, transparent)',
        }}
      />
      {/* Degradado derecho */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-10 z-10 transition-opacity duration-200"
        style={{
          opacity: showRight ? 1 : 0,
          background: 'linear-gradient(to left, var(--color-bg) 30%, transparent)',
        }}
      />

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        <Link
          href="/catalogo"
          className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
          style={
            !categoriaActual
              ? { backgroundColor: 'var(--color-brand)', color: '#fff', borderColor: 'var(--color-brand)' }
              : { backgroundColor: 'var(--color-surface)', color: 'var(--color-muted)', borderColor: 'var(--color-border)' }
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
                ? { backgroundColor: 'var(--color-brand)', color: '#fff', borderColor: 'var(--color-brand)' }
                : { backgroundColor: 'var(--color-surface)', color: 'var(--color-muted)', borderColor: 'var(--color-border)' }
            }
          >
            {cat.nombre}
          </Link>
        ))}
      </div>
    </div>
  )
}

