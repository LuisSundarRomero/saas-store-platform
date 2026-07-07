'use client'

import { useState } from 'react'
import { IconMenu2, IconX, IconBrandWhatsapp } from '@tabler/icons-react'

const V = '#6C2BD9'
const J = '#00A389'

const NAV_LINKS = [
  { href: '#problema',       label: 'El problema' },
  { href: '#como-funciona',  label: 'Cómo funciona' },
  { href: '#planes',         label: 'Planes' },
  { href: '#proceso',        label: 'El proceso' },
  { href: '#nosotros',       label: 'Quiénes somos' },
]

interface Props {
  waUrl: string
}

export function MobileMenu({ waUrl }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Botón hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl border transition-colors"
        style={{ borderColor: '#EDE9F4', color: '#6B6080' }}
        aria-label="Abrir menú"
      >
        <IconMenu2 size={20} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col transition-transform duration-300"
        style={{
          backgroundColor: '#fff',
          boxShadow: '-4px 0 24px rgba(108,43,217,0.12)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header del drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#EDE9F4' }}>
          <span className="font-bold text-lg">
            <span style={{ color: V }}>pe</span><span style={{ color: J }}>shoop</span>
          </span>
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
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ color: '#221A2E' }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="px-4 py-5 border-t" style={{ borderColor: '#EDE9F4' }}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 w-full font-semibold px-5 py-3.5 rounded-full text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: V, color: '#fff' }}
          >
            <IconBrandWhatsapp size={18} />
            Crear mi tienda gratis
          </a>
        </div>
      </div>
    </>
  )
}
