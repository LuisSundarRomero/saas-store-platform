'use client'

import { useState, useEffect } from 'react'
import { IconBrandWhatsapp } from '@tabler/icons-react'
import { Wordmark } from './Wordmark'
import { MobileMenu } from './MobileMenu'

const NAV_LINKS = [
  { href: '#te-pasa',      label: '¿Te pasa?' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#planes',        label: 'Planes' },
  { href: '#proceso',       label: 'El proceso' },
  { href: '#nosotros',      label: 'Quiénes somos' },
]

interface Props {
  waUrl: string
}

export function NavBar({ waUrl }: Props) {
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 8)
      // Si el usuario está por encima del primer section, ningún link activo
      const firstSection = document.getElementById('te-pasa')
      if (firstSection && y < firstSection.offsetTop - 80) {
        setActive('')
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.href.slice(1))
    const observers: IntersectionObserver[] = []

    ids.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive('#' + id) },
        // Activa cuando la sección ocupa el 25-80% central del viewport
        { rootMargin: '-15% 0px -65% 0px', threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-30 bg-white/95 border-b border-pborder px-6 py-0 transition-shadow duration-200"
      style={{
        backdropFilter: 'blur(10px)',
        boxShadow: scrolled ? '0 1px 12px rgba(108,43,217,0.08)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6 h-16">
        {/* Logo */}
        <a href="#" className="shrink-0 select-none">
          <Wordmark className="text-xl" />
        </a>

        {/* Links — desktop */}
        <div className="hidden lg:flex items-center gap-0 flex-1 justify-center">
          {NAV_LINKS.map((l) => {
            const isActive = active === l.href
            return (
              <a
                key={l.href}
                href={l.href}
                className="relative px-4 py-5 text-sm font-medium transition-colors duration-150"
                style={{ color: isActive ? '#6C2BD9' : '#6B6080' }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#221A2E' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#6B6080' }}
              >
                {l.label}
                <span
                  className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full transition-transform duration-200 origin-center"
                  style={{
                    backgroundColor: '#6C2BD9',
                    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />
              </a>
            )
          })}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="#planes"
            className="hidden md:block text-sm font-medium text-pmuted hover:text-ptxt transition-colors px-3 py-2"
          >
            Ver planes
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#00A389', color: '#fff' }}
          >
            <IconBrandWhatsapp size={15} />
            Crear mi tienda
          </a>
          <MobileMenu waUrl={waUrl} />
        </div>
      </div>
    </nav>
  )
}
