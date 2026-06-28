import Image from 'next/image'
import type { ConfigNosotros } from '@/types'

interface Props {
  config: ConfigNosotros
}

export function NosotrosSection({ config }: Props) {
  /* ── Sin imagen: layout centrado editorial ── */
  if (!config.imagen_url) {
    return (
      <section className="py-20 sm:py-28" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          {config.subtitulo && (
            <>
              <span
                className="inline-block text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ color: 'var(--color-brand)' }}
              >
                {config.subtitulo}
              </span>
              <div className="w-10 h-px mx-auto mt-4 mb-8" style={{ backgroundColor: 'var(--color-brand)' }} />
            </>
          )}
          <h2
            className="font-display text-4xl sm:text-5xl font-bold leading-[1.08] mb-6"
            style={{ color: 'var(--color-ink)' }}
          >
            {config.titulo}
          </h2>
          {config.descripcion && (
            <p
              className="text-base sm:text-lg leading-relaxed whitespace-pre-line"
              style={{ color: 'var(--color-muted)' }}
            >
              {config.descripcion}
            </p>
          )}
        </div>
      </section>
    )
  }

  /* ── Con imagen: split editorial ── */
  return (
    <section className="overflow-hidden" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-2">

        {/* Imagen — full-bleed portrait */}
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[600px] order-first">
          <Image
            src={config.imagen_url}
            alt={config.titulo}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-24 lg:hidden"
            style={{ background: 'linear-gradient(to bottom, transparent, var(--color-surface-alt))' }}
          />
        </div>

        {/* Contenido */}
        <div className="flex flex-col justify-center px-8 py-14 sm:px-12 lg:px-16 xl:px-20">

          {config.subtitulo && (
            <div className="flex items-center gap-3 mb-7">
              <div className="w-8 h-px shrink-0" style={{ backgroundColor: 'var(--color-brand)' }} />
              <span
                className="text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ color: 'var(--color-brand)' }}
              >
                {config.subtitulo}
              </span>
            </div>
          )}

          <h2
            className="font-display text-4xl sm:text-5xl font-bold leading-[1.08] mb-5"
            style={{ color: 'var(--color-ink)' }}
          >
            {config.titulo}
          </h2>

          <div className="w-14 h-0.5 mb-7" style={{ backgroundColor: 'var(--color-brand)', opacity: 0.25 }} />

          {config.descripcion && (
            <p
              className="text-[15px] leading-[1.75] whitespace-pre-line"
              style={{ color: 'var(--color-muted)' }}
            >
              {config.descripcion}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
