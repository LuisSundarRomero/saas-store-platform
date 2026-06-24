'use client'

import Link from 'next/link'
import { IconBrandWhatsapp, IconMail, IconBrandInstagram, IconBrandTiktok } from '@tabler/icons-react'

interface Categoria { nombre: string; slug: string }

interface Props {
  tiendaNombre?: string
  logoUrl?: string
  descripcion?: string
  politica?: string
  whatsapp?: string
  email?: string
  tagline?: string
  instagram?: string
  tiktok?: string
  categorias?: Categoria[]
  infoItems?: string[]
}

export function Footer({
  tiendaNombre = 'Mi Tienda',
  logoUrl = '',
  descripcion = '',
  politica = '',
  whatsapp = '',
  email = '',
  tagline = '',
  instagram = '',
  tiktok = '',
  categorias = [],
  infoItems = [],
}: Props) {
  const waNum = whatsapp.replace(/\s/g, '')
  const year = new Date().getFullYear()

  const surface = { backgroundColor: 'var(--color-surface-alt)', borderColor: 'var(--color-border)' }
  const iconBtn = 'w-9 h-9 rounded-xl flex items-center justify-center border transition-all'

  return (
    <footer className="mt-auto border-t" style={surface}>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Marca */}
          <div className="sm:col-span-2 lg:col-span-1">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={tiendaNombre}
                className="h-10 w-auto object-contain"
                style={{ maxWidth: '160px' }}
              />
            ) : (
              <span className="font-display text-2xl" style={{ color: 'var(--color-ink)' }}>
                {tiendaNombre}
              </span>
            )}
            {descripcion && (
              <p className="text-sm mt-3 leading-relaxed max-w-xs" style={{ color: 'var(--color-muted)' }}>{descripcion}</p>
            )}
            <div className="flex gap-2.5 mt-5">
              {waNum && (
                <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer"
                  className={iconBtn}
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted)' }}>
                  <IconBrandWhatsapp size={16} />
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`}
                  className={iconBtn}
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-brand)'; e.currentTarget.style.color = 'var(--color-brand)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted)' }}>
                  <IconMail size={16} />
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer"
                  className={iconBtn}
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-brand)'; e.currentTarget.style.color = 'var(--color-brand)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted)' }}>
                  <IconBrandInstagram size={16} />
                </a>
              )}
              {tiktok && (
                <a href={tiktok} target="_blank" rel="noopener noreferrer"
                  className={iconBtn}
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-ink)'; e.currentTarget.style.color = 'var(--color-ink)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted)' }}>
                  <IconBrandTiktok size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Tienda */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-muted)' }}>Tienda</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/catalogo" className="text-sm transition-colors flex items-center gap-2 group"
                style={{ color: 'var(--color-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
                <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-brand)' }} />
                Todos los productos
              </Link>
              {categorias.map((cat) => (
                <Link key={cat.slug} href={`/catalogo?cat=${cat.slug}`}
                  className="text-sm transition-colors flex items-center gap-2 group capitalize"
                  style={{ color: 'var(--color-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-brand)' }} />
                  {cat.nombre}
                </Link>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-muted)' }}>Información</p>
            <div className="flex flex-col gap-3">
              {politica && (
                <p className="text-sm leading-relaxed pb-3 border-b" style={{ color: 'var(--color-muted)', borderColor: 'var(--color-border)' }}>
                  {politica}
                </p>
              )}
              {infoItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-brand)' }} />
                  <p className="text-sm leading-snug" style={{ color: 'var(--color-muted)' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-muted)' }}>Contacto</p>
            <div className="flex flex-col gap-3">
              {waNum && (
                <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer"
                  className="text-sm transition-colors flex items-center gap-2"
                  style={{ color: 'var(--color-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#22c55e')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
                  <IconBrandWhatsapp size={15} className="shrink-0" /> +{waNum}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`}
                  className="text-sm transition-colors flex items-center gap-2"
                  style={{ color: 'var(--color-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-brand)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
                  <IconMail size={15} className="shrink-0" /> {email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs order-1" style={{ color: 'var(--color-muted)' }}>© {year} {tiendaNombre} — Todos los derechos reservados</p>

          <div className="flex items-center gap-x-5 gap-y-2 flex-wrap justify-center order-3 sm:order-2">
            {[
              { href: '/libro-de-reclamaciones', label: 'Libro de Reclamaciones' },
              { href: '/terminos-y-condiciones', label: 'Términos y condiciones' },
              { href: '/politica-de-privacidad', label: 'Política de privacidad' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="text-xs transition-colors"
                style={{ color: 'var(--color-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
                {label}
              </Link>
            ))}
          </div>

          {tagline && (
            <p className="text-xs font-medium order-2 sm:order-3" style={{ color: 'var(--color-brand)' }}>{tagline}</p>
          )}
        </div>
      </div>
    </footer>
  )
}
