'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

interface Slide {
  src: string
  href: string
  alt?: string
}

const AUTOPLAY_MS = 5000

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = trackRef.current
    if (!el || slides.length <= 1) return
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth)
      setActive(i)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [slides.length])

  useEffect(() => {
    const el = trackRef.current
    if (!el || slides.length <= 1) return
    const id = setInterval(() => {
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % slides.length
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [slides.length])

  function goTo(i: number) {
    const el = trackRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  if (slides.length === 0) return null

  return (
    <div className="relative group/carousel">
      <div
        ref={trackRef}
        className="flex overflow-x-auto snap-x snap-mandatory rounded-2xl aspect-[4/5] sm:aspect-square lg:aspect-auto lg:h-[min(640px,75vh)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <Link key={i} href={s.href}
            className="group relative shrink-0 w-full h-full snap-center bg-[#1F1F22]">
            <Image src={s.src} alt={s.alt ?? ''} fill
              className="object-cover lg:object-contain group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority={i === 0}
              loading={i === 0 ? undefined : 'lazy'}
            />
          </Link>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          {/* Flechas — solo desktop, aparecen al pasar el cursor */}
          <button type="button" onClick={() => goTo((active - 1 + slides.length) % slides.length)}
            aria-label="Imagen anterior"
            className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 hover:scale-105"
            style={{ backgroundColor: 'rgba(18,18,20,0.55)', backdropFilter: 'blur(4px)' }}>
            <IconChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => goTo((active + 1) % slides.length)}
            aria-label="Imagen siguiente"
            className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 hover:scale-105"
            style={{ backgroundColor: 'rgba(18,18,20,0.55)', backdropFilter: 'blur(4px)' }}>
            <IconChevronRight size={20} />
          </button>

          {/* Indicadores — área táctil ampliada para móvil */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {slides.map((_, i) => (
              <button key={i} type="button" onClick={() => goTo(i)}
                aria-label={`Ir a la imagen ${i + 1}`}
                className="flex items-center justify-center p-2.5 -m-0.5">
                <span className="h-2 rounded-full transition-all duration-300 block"
                  style={{
                    width: i === active ? '18px' : '8px',
                    backgroundColor: i === active ? 'var(--color-brand)' : 'rgba(255,255,255,0.4)',
                  }}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

