'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { IconBrandWhatsapp } from '@tabler/icons-react'
import { MobileMenu } from './MobileMenu'

const NAV_LINKS = [
  { href: '#te-pasa',       label: '¿Te pasa?' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#planes',        label: 'Planes' },
  { href: '#proceso',       label: 'El proceso' },
  { href: '#nosotros',      label: 'Quiénes somos' },
  { href: '#preguntas',     label: 'Preguntas' },
]

const NAV_HEIGHT = 64 // h-16

interface Props {
  waUrl: string
}

export function NavBar({ waUrl }: Props) {
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.href.slice(1))

    const update = () => {
      const y = window.scrollY
      setScrolled(y > 8)

      // Punto de referencia: 1/3 del viewport desde arriba, tras el nav
      const trigger = y + NAV_HEIGHT + window.innerHeight * 0.18

      // Busca la última sección cuya parte superior está por encima del trigger
      let found = ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= trigger) found = '#' + id
      }

      // Si el scroll está antes del primer section, limpia
      const firstEl = document.getElementById(ids[0])
      if (firstEl && y + NAV_HEIGHT < firstEl.offsetTop) found = ''

      setActive(found)
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
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
          <Image src="/logo-peshoop.webp" alt="Peshoop" width={100} height={30} priority className="h-6 w-auto" />
        </a>

        {/* Links — desktop */}
        <div className="hidden lg:flex items-center gap-0 flex-1 justify-center">
          {NAV_LINKS.map((l) => {
            const isActive = active === l.href
            return (
              <a
                key={l.href}
                href={l.href}
                data-active={isActive ? 'true' : undefined}
                className="nav-link relative px-4 py-5 text-sm font-medium transition-colors duration-150 text-pmuted hover:text-ptxt data-[active]:text-pv"
              >
                {l.label}
                <span
                  className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-pv transition-transform duration-200 origin-center"
                  style={{ transform: isActive ? 'scaleX(1)' : 'scaleX(0)' }}
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
            className="flex items-center gap-2 text-sm font-semibold px-3 sm:px-4 py-2 rounded-full transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#00A389', color: '#fff' }}
          >
            <IconBrandWhatsapp size={15} />
            <span className="hidden sm:inline">Crear mi tienda</span>
          </a>
          <MobileMenu active={active} waUrl={waUrl} />
        </div>
      </div>
    </nav>
  )
}
