'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { IconMenu2, IconX } from '@tabler/icons-react'

const NAV_LINKS = [
  { href: '#te-pasa',       label: '¿Te pasa?' },
  { href: '#como-funciona',  label: 'Cómo funciona' },
  { href: '#planes',         label: 'Planes' },
  { href: '#proceso',        label: 'El proceso' },
  { href: '#nosotros',       label: 'Quiénes somos' },
]

interface Props {
  active?: string
}

export function MobileMenu({ active = '' }: Props) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Cierra automáticamente al pasar a desktop
  useEffect(() => {
    const close = () => { if (window.innerWidth >= 1024) setOpen(false) }
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  // Bloquea scroll del body cuando está abierto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const portal = mounted ? createPortal(
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
          style={{ zIndex: 9998 }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 w-72 flex flex-col lg:hidden transition-transform duration-300"
        style={{
          zIndex: 9999,
          backgroundColor: '#fff',
          boxShadow: open ? '-4px 0 24px rgba(108,43,217,0.14)' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(110%)',
          visibility: open ? 'visible' : 'hidden',
        }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#EDE9F4' }}>
          <Image src="/logo-peshoop.webp" alt="Peshoop" width={100} height={30} className="h-6 w-auto" />
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-50"
            style={{ color: '#6B6080' }}
            aria-label="Cerrar menú"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_LINKS.map((l) => {
            const isActive = active === l.href
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50"
                style={{
                  color: isActive ? '#6C2BD9' : '#221A2E',
                  backgroundColor: isActive ? '#F3EDFC' : 'transparent',
                }}
              >
                {l.label}
              </a>
            )
          })}
        </nav>
      </div>
    </>,
    document.body
  ) : null

  return (
    <>
      {/* Botón hamburger — solo mobile */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl border transition-colors"
        style={{ borderColor: '#EDE9F4', color: '#6B6080' }}
        aria-label="Abrir menú"
      >
        <IconMenu2 size={20} />
      </button>

      {portal}
    </>
  )
}
