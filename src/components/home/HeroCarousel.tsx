'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

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
    <div className="relative">
      <div
        ref={trackRef}
        className="flex overflow-x-auto snap-x snap-mandatory rounded-2xl aspect-[4/5] sm:aspect-square lg:aspect-auto lg:h-[min(640px,75vh)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <Link key={i} href={s.href}
            className="group relative shrink-0 w-full h-full snap-center bg-[#1F1F22]">
            <img src={s.src} alt={s.alt ?? ''}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </Link>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button key={i} type="button" onClick={() => goTo(i)}
              aria-label={`Ir a la imagen ${i + 1}`}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === active ? '18px' : '8px',
                backgroundColor: i === active ? '#E11D2E' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
