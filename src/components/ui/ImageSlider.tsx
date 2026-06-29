'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconZoomIn,
} from '@tabler/icons-react'

// ── Types ────────────────────────────────────────────────────────────────────

type SlideItem = {
  src: string
  alt?: string
  href?: string
}

type AspectRatio = 'square' | 'portrait' | 'landscape' | 'cinema' | 'auto'

type ImageSliderProps = {
  slides: SlideItem[]
  mode: 'product' | 'banner'
  className?: string
  rounded?: boolean
  slideBg?: string
  // product
  discountBadge?: number
  stockBadge?: number
  // banner
  autoplayMs?: number
  aspectRatio?: AspectRatio
  showArrows?: boolean
  showDots?: boolean
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const ASPECT_CLASSES: Record<AspectRatio, string> = {
  square:    'aspect-square',
  portrait:  'aspect-[4/5]',
  landscape: 'aspect-video',
  cinema:    'aspect-[21/9]',
  auto:      'lg:h-[min(640px,75vh)] aspect-[4/5] sm:aspect-square lg:aspect-auto',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Dots({
  count,
  active,
  onGo,
}: {
  count: number
  active: number
  onGo: (i: number) => void
}) {
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onGo(i)}
          aria-label={`Ir a la imagen ${i + 1}`}
          className="flex items-center justify-center p-2.5 -m-0.5"
          style={{ touchAction: 'manipulation' }}
        >
          <span
            className="h-2 rounded-full transition-all duration-300 block"
            style={{
              width: i === active ? '18px' : '8px',
              backgroundColor:
                i === active ? 'var(--color-brand)' : 'rgba(255,255,255,0.45)',
            }}
          />
        </button>
      ))}
    </div>
  )
}

function NavArrow({
  dir,
  onClick,
}: {
  dir: 'prev' | 'next'
  onClick: () => void
}) {
  const isLeft = dir === 'prev'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isLeft ? 'Imagen anterior' : 'Imagen siguiente'}
      className="hidden lg:flex absolute top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full text-white opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200 hover:scale-105 z-10"
      style={{
        [isLeft ? 'left' : 'right']: '12px',
        backgroundColor: 'rgba(18,18,20,0.55)',
        backdropFilter: 'blur(4px)',
        touchAction: 'manipulation',
      }}
    >
      {isLeft ? <IconChevronLeft size={20} /> : <IconChevronRight size={20} />}
    </button>
  )
}

// ── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  slides,
  activeIndex,
  onClose,
  onPrev,
  onNext,
}: {
  slides: SlideItem[]
  activeIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const hasMany = slides.length > 1

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, onPrev, onNext])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="Vista completa de imagen"
      onClick={onClose}
    >
      {/* Cerrar */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full text-white hover:opacity-80 transition-opacity z-20"
        style={{ backgroundColor: 'rgba(255,255,255,0.12)', touchAction: 'manipulation' }}
      >
        <IconX size={22} />
      </button>

      {hasMany && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPrev() }}
            aria-label="Imagen anterior"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-white hover:opacity-80 transition-opacity z-20"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', touchAction: 'manipulation' }}
          >
            <IconChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNext() }}
            aria-label="Imagen siguiente"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-white hover:opacity-80 transition-opacity z-20"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', touchAction: 'manipulation' }}
          >
            <IconChevronRight size={22} />
          </button>
        </>
      )}

      <div
        className="relative w-full h-full max-w-5xl max-h-[85vh] m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={slides[activeIndex].src}
          alt={slides[activeIndex].alt ?? ''}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      {hasMany && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {slides.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-300 block"
              style={{
                width: i === activeIndex ? '18px' : '6px',
                backgroundColor:
                  i === activeIndex ? 'var(--color-brand)' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Product Gallery ───────────────────────────────────────────────────────────

function ProductGallery({
  slides,
  discountBadge,
  stockBadge,
  rounded,
  slideBg = 'var(--color-surface)',
}: {
  slides: SlideItem[]
  discountBadge?: number
  stockBadge?: number
  rounded: boolean
  slideBg?: string
}) {
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const total = slides.length
  const prev = useCallback(() => setActive((i) => (i - 1 + total) % total), [total])
  const next = useCallback(() => setActive((i) => (i + 1) % total), [total])

  if (total === 0) return null

  return (
    <>
      <div role="region" aria-label="Galería de imágenes">
        {/* Imagen principal */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Ver imagen en tamaño completo"
          className={`group relative aspect-square lg:aspect-[4/5] w-full overflow-hidden cursor-zoom-in${rounded ? ' lg:rounded-2xl' : ''}`}
          style={{ backgroundColor: slideBg }}
        >
          <Image
            src={slides[active].src}
            alt={slides[active].alt ?? ''}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />

          {/* Badge stock bajo */}
          {stockBadge !== undefined && stockBadge > 0 && (
            <div className="absolute top-3 left-3">
              <span className="bg-amber-400 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Últimas {stockBadge}
              </span>
            </div>
          )}

          {/* Badge descuento */}
          {discountBadge !== undefined && discountBadge > 0 && (
            <div className="absolute top-3 right-3">
              <span
                className="text-white text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'var(--color-brand)' }}
              >
                -{discountBadge}%
              </span>
            </div>
          )}

          {/* Ícono zoom */}
          <span
            className="absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full text-white opacity-80 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: 'rgba(18,18,20,0.55)', backdropFilter: 'blur(4px)' }}
          >
            <IconZoomIn size={18} />
          </span>
        </button>

        {/* Thumbnails */}
        {total > 1 && (
          <div className="flex gap-2 mt-2 px-4 lg:px-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver imagen ${i + 1}`}
                className="shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all"
                style={{
                  border: i === active
                    ? '2px solid var(--color-brand)'
                    : '2px solid transparent',
                  opacity: i === active ? 1 : 0.55,
                  touchAction: 'manipulation',
                }}
              >
                <Image
                  src={s.src}
                  alt={s.alt ?? ''}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                  loading={i === 0 ? undefined : 'lazy'}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          slides={slides}
          activeIndex={active}
          onClose={() => setLightboxOpen(false)}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  )
}

// ── Banner Slider ─────────────────────────────────────────────────────────────

function BannerSlider({
  slides,
  autoplayMs,
  aspectRatio,
  showArrows,
  showDots,
  rounded,
  slideBg = 'var(--color-surface)',
}: {
  slides: SlideItem[]
  autoplayMs: number
  aspectRatio: AspectRatio
  showArrows: boolean
  showDots: boolean
  rounded: boolean
  slideBg?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const pausedRef = useRef(false)
  const total = slides.length

  // Sincronizar dot con scroll
  useEffect(() => {
    const el = trackRef.current
    if (!el || total <= 1) return
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth)
      setActive(i)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [total])

  const goTo = useCallback((i: number) => {
    const el = trackRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }, [])

  const goNext = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    goTo((Math.round(el.scrollLeft / el.clientWidth) + 1) % total)
  }, [goTo, total])

  const goPrev = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    goTo((Math.round(el.scrollLeft / el.clientWidth) - 1 + total) % total)
  }, [goTo, total])

  // Autoplay — pausa si tab oculta o hover
  useEffect(() => {
    if (!autoplayMs || total <= 1) return
    const onVisibility = () => { pausedRef.current = document.hidden }
    document.addEventListener('visibilitychange', onVisibility)
    const id = setInterval(() => { if (!pausedRef.current) goNext() }, autoplayMs)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [autoplayMs, total, goNext])

  if (total === 0) return null

  const aspectClass = ASPECT_CLASSES[aspectRatio]

  return (
    <div
      className="relative group/slider"
      role="region"
      aria-label="Galería de imágenes"
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      <div
        ref={trackRef}
        className={`flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden${rounded ? ' rounded-2xl' : ''} ${aspectClass}`}
      >
        {slides.map((s, i) => {
          const inner = (
            <Image
              src={s.src}
              alt={s.alt ?? ''}
              fill
              className="object-cover lg:object-contain hover:scale-[1.03] transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 80vw"
              quality={i === 0 ? 80 : 70}
              priority={i === 0}
              loading={i === 0 ? undefined : 'lazy'}
            />
          )

          return s.href ? (
            <Link
              key={i}
              href={s.href}
              aria-label={s.alt || `Ver colección ${i + 1}`}
              className="relative shrink-0 w-full h-full snap-center block"
              style={{ backgroundColor: slideBg }}
            >
              {inner}
            </Link>
          ) : (
            <div
              key={i}
              className="relative shrink-0 w-full h-full snap-center"
              style={{ backgroundColor: slideBg }}
            >
              {inner}
            </div>
          )
        })}
      </div>

      {total > 1 && showArrows && (
        <>
          <NavArrow dir="prev" onClick={goPrev} />
          <NavArrow dir="next" onClick={goNext} />
        </>
      )}

      {total > 1 && showDots && (
        <Dots count={total} active={active} onGo={goTo} />
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ImageSlider({
  slides,
  mode,
  className = '',
  rounded = true,
  slideBg,
  discountBadge,
  stockBadge,
  autoplayMs = 5000,
  aspectRatio = 'auto',
  showArrows = true,
  showDots = true,
}: ImageSliderProps) {
  if (slides.length === 0) return null

  return (
    <div className={className}>
      {mode === 'product' ? (
        <ProductGallery
          slides={slides}
          discountBadge={discountBadge}
          stockBadge={stockBadge}
          rounded={rounded}
          slideBg={slideBg}
        />
      ) : (
        <BannerSlider
          slides={slides}
          autoplayMs={autoplayMs}
          aspectRatio={aspectRatio}
          showArrows={showArrows}
          showDots={showDots}
          rounded={rounded}
          slideBg={slideBg}
        />
      )}
    </div>
  )
}

/*
Ejemplos de uso:

// Galería de producto (PDP)
<ImageSlider
  mode="product"
  slides={producto.imagenes.map(src => ({ src, alt: producto.nombre }))}
  discountBadge={20}
  stockBadge={3}
/>

// Hero / banner con autoplay
<ImageSlider
  mode="banner"
  slides={bannerSlides}
  aspectRatio="auto"
  autoplayMs={5000}
/>

// Lookbook / folleto retrato sin autoplay
<ImageSlider
  mode="banner"
  slides={lookbook}
  aspectRatio="portrait"
  autoplayMs={0}
  showArrows={false}
/>

// Folleto landscape
<ImageSlider
  mode="banner"
  slides={slides}
  aspectRatio="landscape"
  autoplayMs={4000}
/>
*/
